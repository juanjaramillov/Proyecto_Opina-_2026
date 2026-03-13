import fs from "fs";
import path from "path";
import csv from "csv-parser";
import fetch from "node-fetch";

const catalogFile = path.resolve("./docs/catalog/master-entity-catalog-curated.csv");
const outputDir = path.resolve("./public/logos/entities");
const reportDir = path.resolve("./docs/catalog");
const reportFile = path.resolve("./docs/catalog/logo-fetch-report.csv");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

function sanitizeSvg(svgText) {
  if (!svgText || typeof svgText !== "string") return null;
  let trimmed = svgText.trim();
  if (trimmed.startsWith("<?xml")) {
      // Find where <svg begins and slice from there just in case, or just trust it
      const svgStart = trimmed.indexOf("<svg");
      if (svgStart !== -1) {
          trimmed = trimmed.slice(svgStart);
      }
  }
  if (!trimmed.startsWith("<svg")) return null;
  return trimmed;
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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

async function trySimpleIcons(entity) {
  const slug = entity.entity_slug?.trim();
  if (!slug) return null;

  const url = `https://cdn.simpleicons.org/${slug}`;
  const imgRes = await downloadImage(url);
  if (!imgRes || imgRes.ext !== "svg") return null;

  return { source: "simpleicons", ...imgRes };
}

async function tryBrandfetch(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://cdn.brandfetch.io/${domain}/logo`;
  const imgRes = await downloadImage(url);
  if (!imgRes) return null;

  return { source: "brandfetch", ...imgRes };
}

async function tryClearbit(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://logo.clearbit.com/${domain}`;
  const imgRes = await downloadImage(url);
  if (!imgRes || imgRes.buffer.length < 500) return null;

  return { source: "clearbit", ...imgRes };
}

async function tryGoogleFavicon(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const imgRes = await downloadImage(url);
  if (!imgRes || imgRes.buffer.length < 500) return null; 

  return { source: "google_favicon", ...imgRes };
}

async function processEntity(entity, reportRows) {
  const slug = entity.entity_slug?.trim();
  const name = entity.entity_name?.trim() || "";
  const domain = entity.domain?.trim() || "";

  if (!slug) {
    reportRows.push({ entity_slug: "", entity_name: name, domain, status: "skipped", source: "", notes: "missing entity_slug" });
    return;
  }

  const existingExt = getExistingLogoExt(slug);
  if (existingExt) {
    reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "already_exists", source: "local", notes: existingExt });
    console.log(`✓ already exists: ${slug}.${existingExt}`);
    return;
  }

  const sources = [trySimpleIcons, tryBrandfetch, tryClearbit, tryGoogleFavicon];
  
  for (const sourceFn of sources) {
    const result = await sourceFn(entity);
    if (result) {
      const filePath = path.join(outputDir, `${slug}.${result.ext}`);
      fs.writeFileSync(filePath, result.buffer);
      reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "downloaded", source: result.source, notes: result.ext });
      console.log(`✓ ${result.source}: ${slug}.${result.ext}`);
      return;
    }
  }

  reportRows.push({ entity_slug: slug, entity_name: name, domain, status: "missing", source: "", notes: "logo not found in configured sources" });
  console.log(`✗ missing logo: ${slug}`);
}

function writeReport(rows) {
  const headers = ["entity_slug", "entity_name", "domain", "status", "source", "notes"];

  const escapeCsv = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(","))
  ];

  fs.writeFileSync(reportFile, lines.join("\n"), "utf8");
}

async function loadEntities() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(catalogFile)
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

  const entities = await loadEntities();
  const reportRows = [];

  for (const entity of entities) {
    await processEntity(entity, reportRows);
    await new Promise(r => setTimeout(r, 200));
  }

  writeReport(reportRows);

  console.log("");
  console.log("Logo fetch complete");
  console.log(`Catalog processed: ${entities.length}`);
  console.log(`Report written to: ${reportFile}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
