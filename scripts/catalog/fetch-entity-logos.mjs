import fs from "fs";
import path from "path";
import csv from "csv-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables for potential API keys (e.g. BRANDFETCH_API_KEY)
dotenv.config({ path: path.resolve(".env.local") });

const catalogFile = path.resolve("./docs/catalog/master-entity-catalog-curated.csv");
const overrideFile = path.resolve("./docs/catalog/logo-overrides.csv");
const outputDir = path.resolve("./public/logos/entities");
const reportDir = path.resolve("./docs/catalog");
const reportFile = path.resolve("./docs/catalog/logo-fetch-report.csv");

// CLI Arguments
const args = process.argv.slice(2);
const flagMissing = args.includes("--missing");
const flagForce = args.includes("--force");
const sourceArg = args.find(a => a.startsWith("--source="));
const forceSource = sourceArg ? sourceArg.split("=")[1] : null;
const entityArg = args.find(a => a.startsWith("--entity="));
const forceEntitySlug = entityArg ? entityArg.split("=")[1] : null;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}
if (!fs.existsSync(overrideFile)) {
  fs.writeFileSync(overrideFile, "entity_slug,forced_url,preferred_variant,notes\n", "utf8");
}

function sanitizeSvg(svgText) {
  if (!svgText || typeof svgText !== "string") return null;
  let trimmed = svgText.trim();
  if (trimmed.startsWith("<?xml")) {
      const svgStart = trimmed.indexOf("<svg");
      if (svgStart !== -1) {
          trimmed = trimmed.slice(svgStart);
      }
  }
  if (!trimmed.startsWith("<svg")) return null;
  return trimmed;
}

async function downloadImage(url, customHeaders = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        ...customHeaders
      }
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    let ext = null;
    if (contentType.includes("image/svg+xml")) ext = "svg";
    else if (contentType.includes("image/png")) ext = "png";
    else if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) ext = "jpg";
    else if (contentType.includes("image/webp")) ext = "webp";
    
    let buffer = Buffer.from(await res.arrayBuffer());

    const importCrypto = await import('crypto');
    const hashSum = importCrypto.createHash('md5');
    hashSum.update(buffer);
    const hashHex = hashSum.digest('hex');
    
    // Known MD5 hashes of the Brandfetch generic placeholder error image
    const PLACEHOLDER_HASHES = [
      '25a2dfbd88a38ae9e55b1fce6fcdd245', // Old 242859 bytes
      '61adddcce049bf69ecbb291c94411135', // New 242979 bytes
    ];
    
    if (PLACEHOLDER_HASHES.includes(hashHex) || buffer.length === 242979 || buffer.length === 242859) {
      return null;
    }

    if (!ext) {
       if (buffer.length > 4) {
           if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) ext = "png";
           else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) ext = "jpg";
           else if (buffer.toString('utf8', 0, 10).includes('<svg') || buffer.toString('utf8', 0, 10).includes('<?xml')) ext = "svg";
           else ext = "png";
       } else {
           return null;
       }
    }

    if (ext === "svg") {
      const svgOk = sanitizeSvg(buffer.toString('utf8'));
      if (!svgOk) return null;
      buffer = Buffer.from(svgOk, 'utf8');
    }

    return { ext, buffer };
  } catch {
    return null;
  }
}

function getExistingLogoExt(slug) {
  const exts = ["svg", "png", "jpg", "webp"];
  for (const ext of exts) {
    if (fs.existsSync(path.join(outputDir, `${slug}.${ext}`))) return ext;
  }
  return null;
}

function cleanOldLogos(slug) {
  const exts = ["svg", "png", "jpg", "webp"];
  for (const ext of exts) {
    const p = path.join(outputDir, `${slug}.${ext}`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  }
}

async function tryOverride(entity, overrides) {
  const slug = entity.entity_slug?.trim();
  const override = overrides.find(o => o.entity_slug === slug);
  if (!override || !override.forced_url) return null;

  const imgRes = await downloadImage(override.forced_url);
  if (!imgRes) return null;

  return { source: "override", tier: "official", ...imgRes };
}

async function tryBrandfetch(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://cdn.brandfetch.io/${domain}/logo`;
  const headers = {};
  if (process.env.BRANDFETCH_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.BRANDFETCH_API_KEY}`;
  }

  const imgRes = await downloadImage(url, headers);
  if (!imgRes) return null;

  return { source: "brandfetch", tier: "official", ...imgRes };
}

async function trySimpleIcons(entity) {
  const slug = entity.entity_slug?.trim();
  if (!slug) return null;

  const url = `https://cdn.simpleicons.org/${slug}`;
  const imgRes = await downloadImage(url);
  if (!imgRes || imgRes.ext !== "svg") return null;

  return { source: "simpleicons", tier: "acceptable", ...imgRes };
}

async function tryGoogleFavicon(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const imgRes = await downloadImage(url);
  if (!imgRes || imgRes.buffer.length < 500) return null; 

  return { source: "google_favicon", tier: "fallback", ...imgRes };
}

async function processEntity(entity, reportRows, overrides) {
  const slug = entity.entity_slug?.trim();
  const name = entity.entity_name?.trim() || "";
  const domain = entity.domain?.trim() || "";

  if (!slug) {
    reportRows.push({ entity_slug: "", entity_name: name, domain, status: "skipped", tier: "none", source: "", notes: "missing entity_slug" });
    return;
  }

  if (forceEntitySlug && forceEntitySlug !== slug) {
    return; 
  }

  const existingExt = getExistingLogoExt(slug);
  
  if (existingExt && !flagForce && !flagMissing) {
    // If we have it and aren't forcing, just report local
    reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "already_exists", tier: "unknown", source: "local", notes: existingExt });
    return;
  }

  if (flagMissing && existingExt) {
    // If --missing is set and we have it, skip completely to save time in console logs
    reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "already_exists", tier: "unknown", source: "local", notes: existingExt });
    return;
  }

  // Determine allowed sources based on filters
  const allSources = [
    { name: "brandfetch", fn: tryBrandfetch },
    { name: "simpleicons", fn: trySimpleIcons },
    { name: "google_favicon", fn: tryGoogleFavicon },
  ];
  
  let sourcesToTry = allSources;
  if (forceSource) {
      sourcesToTry = allSources.filter(s => s.name === forceSource);
  }

  let result = await tryOverride(entity, overrides);

  if (!result) {
      for (const src of sourcesToTry) {
        result = await src.fn(entity);
        if (result) break;
      }
  }

  if (result) {
    cleanOldLogos(slug); // garbage collect any old formats
    const filePath = path.join(outputDir, `${slug}.${result.ext}`);
    fs.writeFileSync(filePath, result.buffer);
    reportRows.push({ 
        entity_slug: slug, 
        entity_name: name, 
        domain, 
        status: "downloaded", 
        tier: result.tier,
        source: result.source, 
        notes: result.ext 
    });
    console.log(`✓ [${result.tier.toUpperCase()}] ${result.source}: ${slug}.${result.ext}`);
    return;
  }

  reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "missing", tier: "orphan", source: "", notes: "logo not found" });
  console.log(`✗ [ORPHAN] missing logo: ${slug}`);
}

function writeReport(rows) {
  const headers = ["entity_slug", "entity_name", "domain", "status", "tier", "source", "notes", "updated_at"];
  const now = new Date().toISOString();

  const escapeCsv = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => {
        row.updated_at = now;
        return headers.map((h) => escapeCsv(row[h])).join(",");
    })
  ];

  fs.writeFileSync(reportFile, lines.join("\n"), "utf8");
}

async function loadCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) resolve([]);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function run() {
  if (!fs.existsSync(catalogFile)) {
    console.error(`Catalog file not found: ${catalogFile}`);
    process.exit(1);
  }

  console.log("Loading entities limit flags: ", { missing: flagMissing, force: flagForce, source: forceSource, entity: forceEntitySlug });

  const entities = await loadCsv(catalogFile);
  const overrides = await loadCsv(overrideFile);
  const reportRows = [];

  for (const entity of entities) {
    await processEntity(entity, reportRows, overrides);
    await new Promise(r => setTimeout(r, 200)); // Rate limit
  }

  writeReport(reportRows);

  console.log("");
  console.log("Logo fetch complete");
  console.log(`Entities processed: ${entities.length}`);
  console.log(`Report written to: ${reportFile}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
