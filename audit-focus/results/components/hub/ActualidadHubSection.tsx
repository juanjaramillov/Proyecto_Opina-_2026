import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot, ThermometricInsight } from '../../../../read-models/b2c/hub-types';
import { Target, BarChart2, Zap, ArrowRight } from 'lucide-react';

interface Props {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export const ActualidadHubSection: React.FC<Props> = ({ snapshot, loading }) => {
  const nav = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
         <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const { actualidad } = snapshot.modules;

  if (!actualidad || !actualidad.isAvailable || actualidad.thermometerInsights.length === 0) {
    return (
      <div className="card p-10 border border-stroke bg-surface2/30 shadow-sm rounded-2xl flex flex-col justify-center items-center text-center group">
         <div className="w-20 h-20 rounded-full bg-white border border-stroke flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-[32px] text-primary">gavel</span>
         </div>
         <h3 className="text-xl font-black text-ink mb-3">Pulso de Tendencias Bloqueado</h3>
         <p className="text-sm font-medium text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
           El termómetro social necesita mediciones para perfilar tu postura frente a la agenda pública. Haz oír tu voz en temas coyunturales.
         </p>
         <button 
           onClick={() => nav('/experience')}
           className="btn-secondary px-6 py-2 border-stroke bg-white hover:bg-surface2 transition-all flex items-center gap-2"
        >
           Identificar Tendencias <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const insights = actualidad.thermometerInsights;
  
  // Agrupar por alineación (coincidencia) vs diferencia
  const alignedInsights = insights.filter(i => i.divergenceLevel === 'low' || (i.divergenceLevel === 'medium' && i.userStance === i.consensusStance));
  const divergentInsights = insights.filter(i => i.divergenceLevel === 'high' || (i.divergenceLevel === 'medium' && i.userStance !== i.consensusStance));

  // Calcular un score de "Volatilidad" o "Independencia" basado en la divergencia
  const totalWeight = insights.length * 2; // high = 2, medium = 1, low = 0
  let divergenceScore = 0;
  insights.forEach(i => {
     if (i.divergenceLevel === 'high') divergenceScore += 2;
     else if (i.divergenceLevel === 'medium') divergenceScore += 1;
  });
  const volatilityPercentage = totalWeight > 0 ? Math.round((divergenceScore / totalWeight) * 100) : 0;
  
  // Frase editorial base
  let editorialPhrase = "Tu lectura de actualidad se mueve rápido frente a temas de alta fricción pública.";
  if (volatilityPercentage < 30) {
     editorialPhrase = "En la coyuntura, tiendes a integrarte sólidamente en la corriente general sin mucha oscilación.";
  } else if (volatilityPercentage > 70) {
     editorialPhrase = "En coyuntura, tiendes a separarte abruptamente del promedio, marcando extrema independencia.";
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* 1. Módulo Editorial / Mini Portada */}
      <div className="card p-6 border-l-4 border-l-primary border-t border-r border-b border-stroke bg-surface2/40 rounded-r-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
              <BarChart2 className="w-48 h-48 text-primary -mr-12 -mt-12" />
          </div>

          <div className="flex-1 z-10">
             <div className="flex items-center gap-2 mb-3">
               <span className="bg-ink/10 text-ink text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest border border-stroke">
                  Firma Social
               </span>
               <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">
                  {actualidad.recentHotTopicsCount} Debates
               </span>
             </div>
             <h3 className="text-xl md:text-2xl font-black text-ink tracking-tight leading-tight">
                "{editorialPhrase}"
             </h3>
          </div>

          <div className="flex items-center gap-4 z-10 shrink-0">
             <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Índice de Volatilidad</span>
                <span className="text-2xl font-black text-ink">{volatilityPercentage}%</span>
             </div>
             <div className="w-12 h-12 rounded-full border-[3px] border-stroke relative flex items-center justify-center bg-white shadow-sm">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="21" cy="21" r="21" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-stroke" />
                  <circle 
                    cx="21" cy="21" r="21" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="transparent" 
                    strokeDasharray="132" 
                    strokeDashoffset={132 - (132 * volatilityPercentage) / 100} 
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <Zap className={`w-4 h-4 ${volatilityPercentage > 50 ? 'text-primary' : 'text-text-muted'}`} />
             </div>
          </div>
      </div>

      {/* 2. Grid de Alineación vs Diferencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Bloque: Mayor Alineación */}
         <div className="space-y-4">
            <h4 className="text-sm font-black text-ink uppercase tracking-widest border-b border-stroke pb-2">Temas de Mayor Consenso</h4>
            
            {alignedInsights.length === 0 ? (
               <div className="text-sm text-text-muted italic py-4">No hay áreas de fuerte coincidencia detectadas aún.</div>
            ) : (
               <div className="space-y-4">
                  {alignedInsights.map((insight, idx) => (
                     <InsightRow 
                       key={`align-${idx}`} 
                       insight={insight} 
                       type="alignment" 
                     />
                  ))}
               </div>
            )}
         </div>

         {/* Bloque: Mayor Diferencia */}
         <div className="space-y-4">
            <h4 className="text-sm font-black text-ink uppercase tracking-widest border-b border-stroke pb-2 flex items-center gap-2">
               Temas de Disidencia <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </h4>
            
            {divergentInsights.length === 0 ? (
               <div className="text-sm text-text-muted italic py-4">Tus opiniones no registran disidencias marcadas.</div>
            ) : (
               <div className="space-y-4">
                  {divergentInsights.map((insight, idx) => (
                     <InsightRow 
                       key={`div-${idx}`} 
                       insight={insight} 
                       type="divergence" 
                     />
                  ))}
               </div>
            )}
         </div>

      </div>

      {/* 3. Card Call to Action (Cierre del módulo) */}
      <div className="card p-4 border border-dashed border-stroke bg-surface2/20 flex flex-col md:flex-row justify-between items-center rounded-2xl group hover:border-primary/50 transition-colors cursor-pointer mt-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white border border-stroke flex items-center justify-center group-hover:scale-110 transition-transform">
               <Target className="w-5 h-5 text-ink" />
             </div>
             <div>
               <h4 className="text-sm font-black text-ink">Nuevos Debates Activos</h4>
               <p className="text-xs text-text-secondary">Hay eventos urgentes en la agenda nacional. Calibra tu termómetro.</p>
             </div>
          </div>
          <button className="mt-4 md:mt-0 text-[10px] border border-stroke bg-white hover:bg-surface2 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-ink transition-colors">
              Ir a Actualidad
          </button>
      </div>

    </div>
  );
};

// Componente helper para dibujar las minijustificaciones visuales
const InsightRow = ({ insight, type }: { insight: ThermometricInsight, type: 'alignment' | 'divergence' }) => {
   const isDivergent = type === 'divergence';
   
   return (
      <div className={`card p-4 border shadow-sm rounded-xl relative overflow-hidden ${isDivergent ? 'border-primary/20 bg-primary/5' : 'bg-white border-stroke'}`}>
         {/* Etiqueta superior */}
         <div className="flex justify-between items-start mb-2">
            <h5 className="text-sm font-black text-ink leading-tight">{insight.topic}</h5>
            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-widest ${isDivergent ? 'bg-primary/10 text-primary' : 'bg-surface2 text-text-muted'}`}>
               {isDivergent ? (insight.userStance === 'against' ? 'En Contra' : 'A favor') : 'Consenso'}
            </span>
         </div>
         
         <p className="text-xs text-text-secondary leading-relaxed mb-4">
            {insight.description}
         </p>

         {/* Barra comparativa */}
         <div className="flex items-center justify-between text-[10px] font-bold mt-2">
            <div className="flex flex-col gap-1 w-[45%]">
               <span className="text-text-muted uppercase tracking-widest flex items-center gap-1">Tú</span>
               <div className={`h-1.5 w-full rounded-full bg-surface2 overflow-hidden border border-stroke`}>
                  <div className={`h-full w-full rounded-full ${isDivergent ? 'bg-primary' : 'bg-ink'}`}></div>
               </div>
            </div>
            
            <span className="text-stroke px-2">vs</span>

            <div className="flex flex-col gap-1 w-[45%] items-end">
               <span className="text-text-muted uppercase tracking-widest flex items-center gap-1">Mayoría ({insight.consensusPercentage}%)</span>
               <div className={`h-1.5 w-full rounded-full bg-surface2 overflow-hidden border border-stroke flex justify-end`}>
                  <div className={`h-full rounded-full bg-slate-400`} style={{ width: `${insight.consensusPercentage}%` }}></div>
               </div>
            </div>
         </div>
      </div>
   );
};
