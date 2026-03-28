import { useEffect, useState } from "react";
import { adminResultsService } from "../services/adminResultsService";
import { AdminResultsConfiguration } from "../../../services/analytics/analyticsReadService";

export default function AdminResults() {
  const [config, setConfig] = useState<AdminResultsConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminResultsService.getConfiguration();
      setConfig(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if(!config) return;
    setLoading(true);
    await adminResultsService.publishConfiguration(config);
    await load();
  };

  if (loading || !config) return <div className="p-8">Cargando Results Publisher...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Results B2C Publisher</h1>

      <div className="bg-white p-6 border rounded shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Configuración General</h2>
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
            onChange={(e) => setConfig({...config, mode: e.target.value as any})}
            className="w-full border p-2 rounded"
          >
            <option value="synthetic">Synthetic (Curado)</option>
            <option value="hybrid">Hybrid</option>
            <option value="real">Real DB</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
        >
          Publicar Cambios
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        Nota: Esta herramienta controla aspectos editoriales. No permite modificar fórmulas matemáticas base, que son gobernadas por la capa Canónica.
      </div>
    </div>
  );
}
