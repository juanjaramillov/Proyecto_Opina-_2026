import { useEffect, useState } from "react";
import { adminAnalyticsService } from "../services/adminAnalyticsService";
import { AdminAnalyticsSnapshot } from "../../../services/analytics/analyticsReadService";

export default function AdminAnalytics() {
  const [snapshot, setSnapshot] = useState<AdminAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminAnalyticsService.getSnapshot();
      setSnapshot(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await adminAnalyticsService.refreshRollups();
    await load();
  };

  if (loading || !snapshot) return <div className="p-8">Cargando Analytics...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Salud del Sistema Analítico</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded shadow-sm">
          <div className="text-sm text-gray-500">Estado Rollups</div>
          <div className="text-xl font-bold">{snapshot.freshnessStatus}</div>
        </div>
        <div className="p-4 border rounded shadow-sm">
          <div className="text-sm text-gray-500">Señales Procesadas</div>
          <div className="text-xl font-bold">{snapshot.totalSignalsProcessed}</div>
        </div>
        <div className="p-4 border rounded shadow-sm">
          <div className="text-sm text-gray-500">Entidades Activas</div>
          <div className="text-xl font-bold">{snapshot.activeEntities}</div>
        </div>
        <div className="p-4 border rounded shadow-sm">
          <div className="text-sm text-gray-500">Modo de Operación</div>
          <div className="text-xl font-bold">{snapshot.currentMode}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleRefresh}
          className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
        >
          Forzar Recálculo (Rollups)
        </button>
      </div>
    </div>
  );
}
