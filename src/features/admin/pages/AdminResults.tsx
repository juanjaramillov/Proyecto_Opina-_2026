import { useEffect, useState } from "react";
import { adminResultsService } from "../services/adminResultsService";
import { AdminResultsConfiguration } from "../../../services/analytics/analyticsReadService";
import { PublicationMode } from "../../../read-models/analytics/analyticsTypes";
import { METRIC_CATALOG } from "../../../read-models/analytics/metricCatalog";
import { SurfaceMetricConfig, MetricSurface } from "../../../read-models/analytics/analyticsTypes";

export default function AdminResults() {
  const [config, setConfig] = useState<AdminResultsConfiguration | null>(null);
  const [localConfigs, setLocalConfigs] = useState<SurfaceMetricConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminResultsService.getConfiguration();
      setConfig(data);
      setLocalConfigs(data.surfaceConfigs || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if(!config) return;
    setLoading(true);
    const payload = {
      ...config,
      surfaceConfigs: localConfigs
    };
    await adminResultsService.publishConfiguration(payload);
    await load();
  };

  const toggleMetricVisibility = (metricId: string, surfaceId: MetricSurface) => {
    setLocalConfigs(prev => {
      const idx = prev.findIndex(c => c.metric_id === metricId && c.surface_id === surfaceId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], is_visible: !next[idx].is_visible };
        return next;
      }
      
      // Si no existe, lo creamos default para este update
      const baseMet = METRIC_CATALOG[metricId];
      if (!baseMet) return prev;

      return [...prev, {
        surface_id: surfaceId,
        metric_id: metricId,
        is_visible: true, // as it wasn't there, we are turning it on
        slot_key: baseMet.defaultSlot,
        sort_order: baseMet.defaultSortOrder,
        is_pinned: false
      }];
    });
  };

  if (loading || !config) return <div className="p-8">Cargando Results Publisher...</div>;

  const targetSurfaces: MetricSurface[] = ["results_hero", "results_news", "results_versus", "results_depth", "results_tournament"];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Results B2C Publisher (Gobernanza Canónica)</h1>

      <div className="bg-white p-6 border rounded shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Configuración General (Legado)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Título Hero</label>
            <input 
              type="text" 
              value={config.heroTitle}
              onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Modo de Datos</label>
            <select 
              value={config.mode}
              onChange={(e) => setConfig({...config, mode: e.target.value as PublicationMode})}
              className="w-full border p-2 rounded"
            >
              <option value="curated">Curated (Placeholder/Editorial)</option>
              <option value="hybrid">Hybrid (Fallback Mixto)</option>
              <option value="real">Real DB (Supabase API)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border rounded shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-2">Composición de Componentes (Slots)</h2>
        <p className="text-sm text-gray-500 mb-6">
          Habilita qué métricas deben estar presentes en cada superficie de resultados para la audiencia B2C. 
          Las métricas mostradas dependen del Catálogo Central de Gobernanza.
        </p>
        
        {targetSurfaces.map(s => {
          // Filtrar las métricas que dicen estar permitidas en este surface
          const allowedMetrics = Object.values(METRIC_CATALOG).filter(m => m.surfaces.includes(s));
          if (allowedMetrics.length === 0) return null;

          return (
            <div key={s} className="mb-8 p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-4 border-b pb-2">Surface: {s}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allowedMetrics.map(m => {
                  const conf = localConfigs.find(c => c.metric_id === m.id && c.surface_id === s);
                  const isVisible = conf ? conf.is_visible : false; // Por defecto apagado si no está

                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 border rounded bg-white overflow-hidden shadow-sm">
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-gray-800 truncate">{m.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-tight">{m.id}</span>
                      </div>
                      <button
                        onClick={() => toggleMetricVisibility(m.id, s)}
                        className={`ml-2 relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${isVisible ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 mt-8 sticky bottom-8 p-4 bg-white/90 backdrop-blur border-t rounded-t shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
        >
          Guardar y Publicar
        </button>
      </div>

    </div>
  );
}
