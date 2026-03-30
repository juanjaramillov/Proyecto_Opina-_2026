const fs = require('fs');
let code = fs.readFileSync('src/read-models/analytics/metricCatalog.ts', 'utf8');

const toLive = [
  'margin_vs_second',
  'stability_label',
  'topic_heat_index'
];

for (const kpi of toLive) {
  const rgx = new RegExp(kpi + ': \\{');
  const match = code.match(rgx);
  if (!match) continue;
  
  const kpiIdx = match.index;
  const endIdx = code.indexOf('},', kpiIdx);
  const block = code.substring(kpiIdx, endIdx);
  
  const newBlock = block.replace(/status: ['"]pending_instrumentation['"]/, 'status: "live"');
  
  code = code.substring(0, kpiIdx) + newBlock + code.substring(endIdx);
}

fs.writeFileSync('src/read-models/analytics/metricCatalog.ts', code);
console.log('Fixed missing KPIs');
