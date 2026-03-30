const fs = require('fs');

let code = fs.readFileSync('src/read-models/analytics/metricCatalog.ts', 'utf8');

const toLive = [
  'weighted_preference_share',
  'leader_rank',
  'margin_vs_second',
  'weighted_win_rate',
  'wilson_lower_bound',
  'wilson_upper_bound',
  'time_decay_momentum',
  'entropy_normalized',
  'stability_label',
  'integrity_score',
  'topic_heat_index',
  'generation_gap_index'
];

// 1. Convert listed KPIs to 'live'
for (const kpi of toLive) {
  const kpiIdx = code.indexOf(`${kpi}: {`);
  if (kpiIdx === -1) {
    console.error(`KPI ${kpi} not found.`);
    continue;
  }
  
  const endIdx = code.indexOf('},', kpiIdx);
  const block = code.substring(kpiIdx, endIdx);
  
  const newBlock = block.replace(/status: 'pending_instrumentation'/, "status: 'live'")
                        .replace(/status: "pending_instrumentation"/, 'status: "live"');
  
  code = code.substring(0, kpiIdx) + newBlock + code.substring(endIdx);
}

// 2. Fix generation_gap_label (surface: results_footer)
const genIdx = code.indexOf('generation_gap_label: {');
if (genIdx !== -1) {
  const genEndIdx = code.indexOf('},', genIdx);
  let genBlock = code.substring(genIdx, genEndIdx);
  genBlock = genBlock.replace(/surfaces: \['results_pulse', 'admin_registry'\]/, "surfaces: ['results_footer', 'results_pulse', 'admin_registry']");
  code = code.substring(0, genIdx) + genBlock + code.substring(genEndIdx);
}

// 3. Make sure any pending_instrumentation has visibleByDefault: false
let finalCode = '';
let currentPos = 0;

while(true) {
  const match = code.substring(currentPos).match(/([a-zA-Z0-9_]+): \{/);
  if (!match) {
    finalCode += code.substring(currentPos);
    break;
  }
  const blockStart = currentPos + match.index;
  const blockEnd = code.indexOf('},', blockStart) + 2;

  if (blockEnd < blockStart) break;

  let block = code.substring(blockStart, blockEnd);

  if (block.includes("status: 'pending_instrumentation'") || block.includes('status: "pending_instrumentation"')) {
    block = block.replace(/visibleByDefault:\s*true/g, 'visibleByDefault: false');
  }

  finalCode += code.substring(currentPos, blockStart) + block;
  currentPos = blockEnd;
}

fs.writeFileSync('src/read-models/analytics/metricCatalog.ts', finalCode);
console.log('Catalog synchronized successfully.');
