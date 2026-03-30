import { METRIC_CATALOG } from './src/read-models/analytics/metricCatalog.ts';

const liveKPIs = Object.values(METRIC_CATALOG).filter(m => m.status === 'live');
const pendingDefault = Object.values(METRIC_CATALOG).filter(m => m.status === 'pending_instrumentation' && m.visibleByDefault === true);

console.log("=== LIVE KPIs ===");
liveKPIs.forEach(m => {
  console.log(`${m.id} | ${m.surfaces.join(',')} | ${m.visibleByDefault ? 'Sí' : 'No'} | ${m.origin}`);
});

console.log("\n=== PENDING BUT DEFAULT ===");
console.log(pendingDefault.map(m => m.id).join(', '));
