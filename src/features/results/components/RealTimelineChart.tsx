import { UserResultsSnapshot, SignalActivity } from '../../../read-models/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Hourglass } from 'lucide-react';

interface RealTimelineChartProps {
  snapshot: UserResultsSnapshot;
  loading: boolean;
}

export function RealTimelineChart({ snapshot, loading }: RealTimelineChartProps) {
  if (loading) {
    return (
      <div className="card p-6 border border-stroke bg-white shadow-sm flex flex-col gap-4 h-[350px]">
        <div className="h-6 w-1/3 bg-slate-200 animate-pulse rounded"></div>
        <div className="flex-1 w-full bg-slate-100 animate-pulse rounded mt-4"></div>
      </div>
    );
  }

  const recentActivity = snapshot.signals?.recent || [];

  if (recentActivity.length === 0) {
    return (
      <div className="card p-6 border border-stroke bg-white shadow-sm h-[350px] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
          <Hourglass className="w-32 h-32 text-ink" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center border border-stroke">
            <TrendingUp className="w-4 h-4 text-text-secondary" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Fluidez de Señales</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stroke rounded-xl bg-surface/50 z-10 mx-2 mb-2 p-6 text-center">
          <p className="text-sm font-bold text-ink mb-1">El lienzo está en blanco</p>
          <p className="text-xs text-text-muted font-medium max-w-[250px]">El gráfico de ondas de actividad comenzará a latir en cuanto interactúes con el ecosistema.</p>
        </div>
      </div>
    );
  }

  // Agrupar actividad reciente por fecha corta (MMM DD)
  const activityByDate = recentActivity.reduce((acc: Record<string, number>, curr: SignalActivity) => {
    const d = new Date(curr.createdAt);
    const dateStr = d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convertir a array para recharts y ordenar cronológicamente
  const rawData = Object.entries(activityByDate).map(([date, count]) => ({ date, count }));
  // Llenar "huecos" con 0 si fuera necesario para una curva perfecta requeriría iteración de días, 
  // pero invertimos el array que nos llega para mostrar la cronología directa.
  const chartData = rawData.reverse();

  return (
    <div className="card border border-stroke bg-white shadow-sm h-[380px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-ink">Evolución en el Tiempo</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Volumen Activo: {recentActivity.length} señales</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 800, textAnchor: 'middle' }} 
              dy={10}
              minTickGap={20}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 800 }} 
              dx={-10}
            />
            <Tooltip 
               cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
               contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-stroke)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
               labelStyle={{ fontWeight: 900, color: 'var(--color-ink)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-stroke)', paddingBottom: '4px' }}
               itemStyle={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '18px' }}
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               formatter={(value: any) => [`${value} aportes`, 'Volumen Diario']}
               animationDuration={300}
            />
            <Area 
               type="monotone" 
               dataKey="count" 
               stroke="var(--color-primary)" 
               strokeWidth={3}
               fillOpacity={1} 
               fill="url(#colorCount)" 
               activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }}
               animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
