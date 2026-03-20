import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterHubSnapshot } from '../../../../read-models/b2c/hub-types';
import { Brain, Layers, GitMerge, ArrowRight } from 'lucide-react';

interface Props {
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export const ProfundidadHubSection: React.FC<Props> = ({ snapshot, loading }) => {
  const nav = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
         <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const { profundidad } = snapshot.modules;

  if (!profundidad || !profundidad.isAvailable || !profundidad.archetype) {
    return (
      <div className="card p-10 border border-stroke bg-surface2/30 shadow-sm rounded-2xl flex flex-col justify-center items-center text-center group">
         <div className="w-20 h-20 rounded-full bg-white border border-stroke flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-[32px] text-primary">psychology_alt</span>
         </div>
         <h3 className="text-xl font-black text-ink mb-3">Lectura Estructural Bloqueada</h3>
         <p className="text-sm font-medium text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
           El motor requiere más contexto transversal. Responde a misiones de marca y debates complejos para definir con exactitud el anclaje de tus decisiones.
         </p>
         <button 
           onClick={() => nav('/experience')}
           className="btn-secondary px-6 py-2 border-stroke bg-white hover:bg-surface2 transition-all flex items-center gap-2"
        >
           Buscar Misiones <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Identificar sesgos principales y secundarios para estructurar la lectura
  const solidStance = profundidad.cognitiveBiases.find(b => b.type === 'primary');
  const ambivalence = profundidad.cognitiveBiases.find(b => b.type === 'secondary');

  const consistency = profundidad.consistencyScore;
  let editorialPhrase = "Cuando profundizas, tu señal se vuelve visiblemente más matizada que en tus decisiones rápidas.";
  let bridgeText = "En formatos como Versus, tu respuesta es instintiva. Aquí, emerge la ambivalencia.";
  
  if (consistency > 75) {
     editorialPhrase = "Tus respuestas largas son un bloque sólido: decides con la misma convicción rápida y profunda.";
     bridgeText = "Tu consistencia no se quiebra al argumentar. Eres predecible y firme en tus convicciones.";
  } else if (consistency < 40) {
     editorialPhrase = "Tu postura muestra alta tensión interna cuando pasas de la elección superficial al fondo.";
     bridgeText = "La información dura genera quiebres en tus paradigmas, haciéndote pivotar con frecuencia.";
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* 1. Módulo Editorial / Mini Portada */}
      <div className="card p-6 border-l-4 border-l-primary border-t border-r border-b border-stroke bg-surface2/40 rounded-r-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none transform -rotate-12 translate-x-4">
              <Brain className="w-64 h-64 text-primary" />
          </div>

          <div className="flex-1 z-10 w-full">
             <div className="flex items-center gap-2 mb-3">
               <span className="bg-ink/10 text-ink text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest border border-stroke flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Arquetipo Analítico
               </span>
               <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">
                  Análisis de Fondo
               </span>
             </div>
             <h3 className="text-xl md:text-2xl font-black text-ink tracking-tight leading-tight mb-2">
                "{editorialPhrase}"
             </h3>
             <p className="text-sm text-text-secondary max-w-2xl font-medium">
                {bridgeText}
             </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card Izquierda - Radar/Resumen */}
        <div className="card p-6 border border-stroke bg-white shadow-sm rounded-2xl flex flex-col justify-between lg:col-span-5 relative overflow-hidden">
           <div className="absolute -right-6 -bottom-6 opacity-[0.02]">
              <span className="material-symbols-outlined text-[150px]">{profundidad.archetype.icon}</span>
           </div>
           
           <div className="z-10">
              <div className="w-12 h-12 rounded-full bg-surface2 border border-stroke flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-ink text-[20px]">{profundidad.archetype.icon}</span>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Clasificación Estructural</h4>
              <h3 className="text-2xl font-black text-ink mb-3 tracking-tight">{profundidad.archetype.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {profundidad.archetype.description}
              </p>
           </div>

           <div className="z-10 bg-surface2/50 rounded-xl p-4 border border-stroke/50">
              <div className="flex justify-between items-end mb-2">
                 <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-1 block">Consistencia de Señal</span>
                 </div>
                 <span className="text-lg font-black text-ink">{consistency}%</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-stroke">
                 <div 
                   className="h-full bg-ink rounded-full transition-all duration-1000"
                   style={{ width: `${consistency}%` }}
                 ></div>
              </div>
           </div>
        </div>

        {/* Cards Derecha - Hallazgos Epistémicos (No solo sesgos sueltos) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
           
           {/* Hallazgo 1: Posición Sólida */}
           {solidStance && (
              <div className="card p-5 border border-stroke bg-surface2/30 shadow-sm rounded-2xl flex gap-4 h-full relative overflow-hidden">
                 <div className="w-1 h-full bg-ink absolute left-0 top-0"></div>
                 <div className="pt-1 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-stroke flex items-center justify-center">
                       <span className={`material-symbols-outlined text-ink text-[16px]`}>{solidStance.icon}</span>
                    </div>
                 </div>
                 <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-text-muted mb-1 block">Ancla Inamovible</span>
                    <h4 className="text-base font-black text-ink mb-1">{solidStance.name}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                       {solidStance.description} Esta es la métrica de fondo que dirige la mayor parte de tu actividad superficial en Opina+.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Peso Relativo</span>
                       <div className="flex-1 h-1.5 bg-surface2 border border-stroke rounded-full overflow-hidden">
                          <div className="h-full bg-ink" style={{ width: `${solidStance.intensity}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {/* Hallazgo 2: Área de Ambivalencia/Tensión */}
           {ambivalence && (
              <div className="card p-5 border border-primary/20 bg-primary/5 shadow-sm rounded-2xl flex gap-4 h-full relative overflow-hidden group">
                 <div className="w-1 h-full bg-primary absolute left-0 top-0"></div>
                 <div className="pt-1 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <GitMerge className="w-4 h-4 text-primary" />
                    </div>
                 </div>
                 <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary mb-1 block">Vector de Tensión y Ambivalencia</span>
                    <h4 className="text-base font-black text-ink mb-1">{ambivalence.name}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                       {ambivalence.description} Aquí es donde tu discurso se fractura al ser interrogado y donde más te separas de tu instinto primario de consumo.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-primary opacity-60 uppercase tracking-widest">Fricción Identificada</span>
                       <div className="flex-1 h-1.5 bg-white border border-stroke rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${ambivalence.intensity}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
           )}
           
        </div>
      </div>
    </div>
  );
};

