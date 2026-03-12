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
  const trimmed = svgText.trim();
  if (!trimmed.startsWith("<svg") && !trimmed.startsWith("<?xml")) return null;
  return trimmed;
}

async function downloadText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OpinaPlusLogoFetcher/1.0"
      }
    });

    if (!res.ok) return null;
    const text = await res.text();
    return text;
  } catch {
    return null;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

async function trySimpleIcons(entity) {
  const slug = entity.entity_slug?.trim();
  if (!slug) return null;

  const url = `https://cdn.simpleicons.org/${slug}`;
  const text = await downloadText(url);
  const svg = sanitizeSvg(text);

  if (!svg) return null;

  return {
    source: "simpleicons",
    svg
  };
}

async function tryBrandfetch(entity) {
  const domain = entity.domain?.trim();
  if (!domain) return null;

  const url = `https://cdn.brandfetch.io/${domain}/logo`;
  const text = await downloadText(url);
  const svg = sanitizeSvg(text);

  if (!svg) return null;

  return {
    source: "brandfetch",
    svg
  };
}

async function processEntity(entity, reportRows) {
  const slug = entity.entity_slug?.trim();
  const name = entity.entity_name?.trim() || "";
  const domain = entity.domain?.trim() || "";

  if (!slug) {
    reportRows.push({
      entity_slug: "",
      entity_name: name,
      domain,
      status: "skipped",
      source: "",
      notes: "missing entity_slug"
    });
    return;
  }

  const filePath = path.join(outputDir, `${slug}.svg`);

  if (fileExists(filePath)) {
    reportRows.push({
      entity_slug: slug,
      entity_name: name,
      domain,
      status: "already_exists",
      source: "local",
      notes: ""
    });
    console.log(`✓ already exists: ${slug}`);
    return;
  }

  const simpleIconsResult = await trySimpleIcons(entity);
  if (simpleIconsResult) {
    fs.writeFileSync(filePath, simpleIconsResult.svg, "utf8");
    reportRows.push({
      entity_slug: slug,
      entity_name: name,
      domain,
      status: "downloaded",
      source: simpleIconsResult.source,
      notes: ""
    });
    console.log(`✓ simpleicons: ${slug}`);
    return;
  }

  const brandfetchResult = await tryBrandfetch(entity);
  if (brandfetchResult) {
    fs.writeFileSync(filePath, brandfetchResult.svg, "utf8");
    reportRows.push({
      entity_slug: slug,
      entity_name: name,
      domain,
      status: "downloaded",
      source: brandfetchResult.source,
      notes: ""
    });
    console.log(`✓ brandfetch: ${slug}`);
    return;
  }

  reportRows.push({
    entity_slug: slug,
    entity_name: name,
    domain,
    status: "missing",
    source: "",
    notes: "logo not found in configured sources"
  });
  console.log(`✗ missing logo: ${slug}`);
}

function writeReport(rows) {
  const headers = [
    "entity_slug",
    "entity_name",
    "domain",
    "status",
    "source",
    "notes"
  ];

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
  if (!fileExists(catalogFile)) {
    console.error(`Catalog file not found: ${catalogFile}`);
    process.exit(1);
  }

  const entities = await loadEntities();
  const reportRows = [];

  for (const entity of entities) {
    await processEntity(entity, reportRows);
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
