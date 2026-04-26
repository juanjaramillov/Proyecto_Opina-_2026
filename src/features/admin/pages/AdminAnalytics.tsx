import { useEffect, useState } from "react";
import { adminAnalyticsService } from "../services/adminAnalyticsService";
import { AdminAnalyticsSnapshot } from "../../../services/analytics/analyticsReadService";
import { METRIC_CATALOG } from "../../../read-models/analytics/metricCatalog";
import { MetricOverride, MetricStatus, MetricAudience, MetricFamily } from "../../../read-models/analytics/analyticsTypes";

export default function AdminAnalytics() {
  const [snapshot, setSnapshot] = useState<AdminAnalyticsSnapshot | null>(null);
  const [overrides, setOverrides] = useState<Record<string, MetricOverride>>({});
  const [loading, setLoading] = useState(true);

  // Filtros
  const [fFamily, setFFamily] = useState<MetricFamily | "all">("all");
  const [fAudience, setFAudience] = useState<MetricAudience | "all">("all");
  const [fStatus, setFStatus] = useState<MetricStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    try {
      const [snapData, overData] = await Promise.all([
        adminAnalyticsService.getSnapshot(),
        adminAnalyticsService.getOverrides()
      ]);
      setSnapshot(snapData);
      
      const overMap: Record<string, MetricOverride> = {};
      overData.forEach(o => overMap[o.metric_id] = o);
      setOverrides(overMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefreshRollups = async () => {
    setLoading(true);
    await adminAnalyticsService.refreshRollups();
    await load();
  };

  const toggleEnabled = async (metricId: string, currentEnabled: boolean) => {
    const existing = overrides[metricId];
    const newOverride: MetricOverride = {
      ...existing,
      metric_id: metricId,
      is_enabled: !currentEnabled
    };
    
    // update optimistic
    setOverrides(prev => ({ ...prev, [metricId]: newOverride }));
    await adminAnalyticsService.saveOverride(newOverride);
  };

  if (loading && !snapshot) return <div className="p-8">Cargando Analytics...</div>;

  // Enriquecer el catalogo con los overrides
  const enrichedMetrics = Object.values(METRIC_CATALOG).map(base => {
    const ov = overrides[base.id];
    return {
      ...base,
      status: ov?.forced_status || base.status,
      visibleByDefault: ov?.visible_by_default_override !== undefined && ov?.visible_by_default_override !== null ? ov.visible_by_default_override : base.visibleByDefault,
      isEnabledAdmin: ov ? ov.is_enabled : true
    };
  });

  // Aplicar filtros
  const filtered = enrichedMetrics.filter(m => {
    if (fFamily !== "all" && m.family !== fFamily) return false;
    if (fAudience !== "all" && !m.allowedAudience.includes(fAudience)) return false;
    if (fStatus !== "all" && m.status !== fStatus) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro Central de KPIs</h1>
      
      {snapshot && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 border rounded shadow-sm bg-white">
            <div className="text-sm text-slate-500">Estado Rollups</div>
            <div className="text-xl font-bold">{snapshot.freshnessStatus}</div>
          </div>
          <div className="p-4 border rounded shadow-sm bg-white">
            <div className="text-sm text-slate-500">Señales Procesadas</div>
            <div className="text-xl font-bold">{snapshot.totalSignalsProcessed}</div>
          </div>
          <div className="p-4 border rounded shadow-sm bg-white">
            <div className="text-sm text-slate-500">Entidades Activas</div>
            <div className="text-xl font-bold">{snapshot.activeEntities}</div>
          </div>
          <div className="flex items-center justify-center p-4 border rounded shadow-sm bg-accent/10">
            <button 
              onClick={handleRefreshRollups}
              className="bg-accent text-white px-4 py-2 rounded font-semibold w-full h-full hover:bg-accent-700 transition-colors"
            >
              Forzar Recálculo
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border rounded shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold">Catálogo de Gobernanza</h2>
          <div className="text-sm text-slate-500">{filtered.length} KPIs listados</div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <select value={fFamily} onChange={e => setFFamily(e.target.value as MetricFamily | "all")} className="border p-2 rounded text-sm">
            <option value="all">Filtro: Todas las Familias</option>
            <option value="market">Market</option>
            <option value="rigor">Rigor</option>
            <option value="depth">Depth</option>
            <option value="actualidad">Actualidad</option>
            <option value="segments">Segments</option>
            <option value="behavior">Behavior</option>
            <option value="integrity">Integrity</option>
            <option value="publication">Publication</option>
          </select>
          <select value={fAudience} onChange={e => setFAudience(e.target.value as MetricAudience | "all")} className="border p-2 rounded text-sm">
            <option value="all">Filtro: Todas las Audiencias</option>
            <option value="results">B2C Results</option>
            <option value="intelligence">B2B Intelligence</option>
            <option value="admin">Admin</option>
            <option value="internal">Internal</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value as MetricStatus | "all")} className="border p-2 rounded text-sm">
            <option value="all">Filtro: Todos los Estados</option>
            <option value="live">Live</option>
            <option value="pending_instrumentation">Pending Instr.</option>
            <option value="experimental">Experimental</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-xs text-slate-700">
                <th className="p-3 font-semibold w-1/4">Métrica</th>
                <th className="p-3 font-semibold text-center">Tipo</th>
                <th className="p-3 font-semibold text-center">En Catálogo</th>
                <th className="p-3 font-semibold text-center">En ReadModel</th>
                <th className="p-3 font-semibold text-center">En UI</th>
                <th className="p-3 font-semibold text-center">Status Final</th>
                <th className="p-3 font-semibold text-right">Visibilidad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 w-1/4">
                    <div className="font-semibold text-accent-900">{m.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.id}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]" title={m.surfaces.join(', ')}>
                      S. Def: {m.surfaces.join(', ')}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {m.visibleByDefault ? (
                      <span className="px-2 py-1 bg-accent-100/50 text-accent-800 rounded font-semibold whitespace-nowrap">Core</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded whitespace-nowrap">Extra</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex w-6 h-6 items-center justify-center bg-accent-100/50 text-accent rounded-full text-xs">✔</span>
                  </td>
                  <td className="p-3 text-center">
                    {m.isWiredToReadModel ? (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-accent-100/50 text-accent rounded-full text-xs">✔</span>
                    ) : (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-slate-100 text-slate-400 rounded-full text-xs">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {m.isWiredToUI ? (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-accent-100/50 text-accent rounded-full text-xs">✔</span>
                    ) : (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-slate-100 text-slate-400 rounded-full text-xs">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                      m.status === 'live' ? 'bg-accent-100/50 text-accent' :
                      m.status === 'pending_instrumentation' ? 'bg-warning/20 text-warning' :
                      m.status === 'experimental' ? 'bg-brand-100 text-brand-700' :
                      'bg-danger/20 text-danger'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleEnabled(m.id, m.isEnabledAdmin)}
                      disabled={m.status === 'pending_instrumentation'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${m.isEnabledAdmin ? 'bg-accent' : 'bg-slate-200'}`}
                      title={m.status === 'pending_instrumentation' ? "No se puede activar un KPI pendiente de instrumentación" : "Activar/Desactivar visibilidad extra"}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${m.isEnabledAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay métricas que coincidan con los filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
