import { useEffect, useState } from "react";
import { adminTrafficService, TrafficSnapshot } from "../services/adminTrafficService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminTrafficDashboard() {
  const [data, setData] = useState<TrafficSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadTraffic = async () => {
    setLoading(true);
    try {
      const snap = await adminTrafficService.getTrafficData(days);
      setData(snap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraffic();
  }, [days]);

  if (loading && !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Buscando señales de tráfico...</p>
        </div>
      </div>
    );
  }

  // Configurations for Chart.js
  const lineChartData = {
    labels: data?.trafficOverTime.map(t => new Date(t.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Sesiones Diarias',
        data: data?.trafficOverTime.map(t => t.sessions) || [],
        borderColor: '#059669', // Emerald 600
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#059669',
      }
    ]
  };

  const deviceChartData = {
    labels: Object.keys(data?.devices || {}),
    datasets: [{
      data: Object.values(data?.devices || {}),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'], // Blue, Emerald, Amber, Violet
      borderWidth: 0,
    }]
  };

  const browserChartData = {
    labels: Object.keys(data?.browsers || {}),
    datasets: [{
      data: Object.values(data?.browsers || {}),
      backgroundColor: ['#6366F1', '#EC4899', '#14B8A6', '#F97316'], // Indigo, Pink, Teal, Orange
      borderWidth: 0,
    }]
  };

  const osChartData = {
    labels: data ? Object.keys(data.os) : [],
    datasets: [{
      data: data ? Object.values(data.os) : [],
      backgroundColor: ['#6366f1', '#e0e7ff', '#4f46e5', '#a5b4fc', '#818cf8', '#c7d2fe'],
      borderWidth: 0,
    }]
  };

  const locationChartData = {
    labels: data ? Object.keys(data.locations).filter(k => k !== 'Desconocido') : [],
    datasets: [{
      data: data ? Object.values(data.locations).filter((_, i) => Object.keys(data!.locations)[i] !== 'Desconocido') : [],
      backgroundColor: ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">monitoring</span>
            Tráfico y Usuarios
          </h1>
          <p className="text-slate-500 font-medium mt-1">Overview tipo Analytics de la plataforma</p>
        </div>

        {/* Filters */}
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${days === d ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {d} Días
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
        </div>
      ) : data && (
        <>
          {/* Top KPIs Row - Grid of 6 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">Usuarios Activos</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-emerald-600 animate-pulse">{data.activeNow}</span>
                <span className="text-slate-400 font-medium text-xs mb-1">ahora</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">Sesiones</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-slate-800">{data.totalSessions}</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">T. Promedio</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-slate-800">{data.avgDurationMinutes >= 1 ? data.avgDurationMinutes.toFixed(1) : Math.round(data.avgDurationMinutes * 60)}</span>
                <span className="text-slate-400 font-medium text-xs mb-1">{data.avgDurationMinutes >= 1 ? 'min' : 'seg'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">Nuevos Úsuarios</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-slate-800">{data.newUsers}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">T. Conversión</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-slate-800">
                  {data.totalSessions > 0 ? ((data.newUsers / data.totalSessions) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <span className="text-slate-500 font-bold text-[11px] mb-1 uppercase tracking-wider">Tasa Rebote</span>
              <div className="flex items-end gap-2 mt-auto">
                <span className="text-3xl lg:text-4xl font-black text-slate-800">{data.bounceRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Line Chart: Traffic over time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tráfico Histórico</h2>
            <div className="h-[250px] w-full">
              <Line 
                data={lineChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Row: Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h2 className="text-lg font-bold text-slate-800 mb-4 self-start">Dispositivos</h2>
              {Object.keys(data.devices).length > 0 ? (
                <div className="h-[200px] w-full flex justify-center pb-4">
                  <Doughnut 
                    data={deviceChartData} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h2 className="text-lg font-bold text-slate-800 mb-4 self-start">Navegadores</h2>
              {Object.keys(data.browsers).length > 0 ? (
                <div className="h-[200px] w-full flex justify-center pb-4">
                  <Doughnut 
                    data={browserChartData} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h2 className="text-lg font-bold text-slate-800 mb-4 self-start">Sistema Operativo</h2>
              {Object.keys(data.os).length > 0 ? (
                <div className="h-[200px] w-full flex justify-center pb-4">
                  <Doughnut 
                    data={osChartData} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
              )}
            </div>
          </div>

          {/* Row: Geography & Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-rose-500">location_on</span>
                <h2 className="text-lg font-bold text-slate-800">Ubicación (Región)</h2>
              </div>
              {Object.keys(data.locations).filter(k => k !== 'Desconocido').length > 0 ? (
                <div className="h-[200px] w-full flex justify-center pb-4">
                  <Doughnut 
                    data={locationChartData} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '50%' }} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm w-full bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Falta configurar ubicaciones o insuficientes datos.
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="w-full flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">local_fire_department</span>
                <h2 className="text-lg font-bold text-slate-800">Secciones Heatmap (Top)</h2>
              </div>
              {data.topSections.length > 0 ? (
                <div className="flex flex-col gap-3 mt-2 h-[200px] overflow-y-auto pr-2">
                  {data.topSections.map((sec, i) => (
                    <div key={sec.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {sec.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-800 text-sm font-black">{sec.views}</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase">vistas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm w-full bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Sin datos recientes
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
