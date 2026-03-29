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
            <div className="text-sm text-gray-500">Estado Rollups</div>
            <div className="text-xl font-bold">{snapshot.freshnessStatus}</div>
          </div>
          <div className="p-4 border rounded shadow-sm bg-white">
            <div className="text-sm text-gray-500">Señales Procesadas</div>
            <div className="text-xl font-bold">{snapshot.totalSignalsProcessed}</div>
          </div>
          <div className="p-4 border rounded shadow-sm bg-white">
            <div className="text-sm text-gray-500">Entidades Activas</div>
            <div className="text-xl font-bold">{snapshot.activeEntities}</div>
          </div>
          <div className="flex items-center justify-center p-4 border rounded shadow-sm bg-indigo-50">
            <button 
              onClick={handleRefreshRollups}
              className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold w-full h-full"
            >
              Forzar Recálculo
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border rounded shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold">Catálogo de Gobernanza</h2>
          <div className="text-sm text-gray-500">{filtered.length} KPIs listados</div>
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
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold">Métrica</th>
                <th className="p-3 font-semibold">Familia</th>
                <th className="p-3 font-semibold">Audiencia</th>
                <th className="p-3 font-semibold">Surfaces Default</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold text-indigo-900">{m.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{m.id}</div>
                  </td>
                  <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{m.family}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {m.allowedAudience.map(a => <span key={a} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] uppercase">{a}</span>)}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-600 max-w-xs truncate">
                    {m.surfaces.join(', ')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      m.status === 'live' ? 'bg-green-100 text-green-800' :
                      m.status === 'pending_instrumentation' ? 'bg-yellow-100 text-yellow-800' :
                      m.status === 'experimental' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleEnabled(m.id, m.isEnabledAdmin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${m.isEnabledAdmin ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${m.isEnabledAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay métricas que coincidan con los filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
