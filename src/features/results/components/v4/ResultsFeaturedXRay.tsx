import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ScanSearch, Sparkles, Activity, Hexagon, ArrowRight } from "lucide-react";
import { ResultsModule, ResultsGeneration } from "../../hooks/useResultsExperience";
import { MasterHubSnapshot } from "../../../../read-models/b2c/hub-types";
import { useNavigate } from "react-router-dom";

interface ResultsFeaturedXRayProps {
  activeModule: ResultsModule;
  activeGeneration: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

// Datos mock dinámicos según el módulo
const getXRayData = (module: ResultsModule) => {
  switch(module) {
    case "VERSUS":
      return {
        title: "Disrupción VS Estabilidad",
        entities: [
          { id: "e1", name: "Innovación Ágil", badge: "Desafiante", color: "bg-indigo-500", text: "text-indigo-600", why: "Ha ganado 15% de terreno en los últimos 7 días.",
            kpis: [{ label: "Fidelidad", value: "78%" }, { label: "Momento", value: "+12 pts" }, { label: "Polarización", value: "Alta" }],
            conclusion: "La innovación agresiva está capitalizando el descontento con el statu quo, pero genera resistencia en segmentos conservadores."
          },
          { id: "e2", name: "Estabilidad Legacy", badge: "Dominante", color: "bg-amber-500", text: "text-amber-600", why: "Mantiene la base de confianza más grande.",
            kpis: [{ label: "Fidelidad", value: "92%" }, { label: "Momento", value: "-3 pts" }, { label: "Polarización", value: "Media" }],
            conclusion: "Sigue siendo el refugio seguro, aunque muestra signos tempranos de fatiga frente a nuevas propuestas."
          }
        ],
        ctaText: "Ver todos los enfrentamientos",
        ctaRoute: "/versus"
      };
    case "TOURNAMENT":
      return {
        title: "El Campeón Defensivo",
        entities: [
          { id: "e1", name: "Sostenibilidad", badge: "Líder", color: "bg-emerald-500", text: "text-emerald-600", why: "Superó a 8 contendientes clave.",
            kpis: [{ label: "Win Rate", value: "85%" }, { label: "Consenso", value: "Muy Alto" }, { label: "Riesgo", value: "Bajo" }],
            conclusion: "Se consolida no como un lujo, sino como el requisito mínimo de entrada en cualquier categoría competitiva."
          },
          { id: "e2", name: "Ciberseguridad", badge: "Finalista", color: "bg-rose-500", text: "text-rose-600", why: "Única categoría capaz de desafiar al líder.",
            kpis: [{ label: "Win Rate", value: "79%" }, { label: "Consenso", value: "Alto" }, { label: "Riesgo", value: "Nulo" }],
            conclusion: "Emerge como la prioridad reactiva más importante frente a la incertidumbre del mercado."
          }
        ],
        ctaText: "Entrar a la Arena",
        ctaRoute: "/tournament"
      };
    case "ACTUALIDAD":
      return {
        title: "Foco de Coyuntura",
        entities: [
          { id: "e1", name: "Gobernanza IA", badge: "Tendencia", color: "bg-rose-500", text: "text-rose-600", why: "Pico de 300% en debates esta semana.",
            kpis: [{ label: "Tracción", value: "Máxima" }, { label: "Acuerdo", value: "32%" }, { label: "Fricción", value: "Severa" }],
            conclusion: "La falta de regulación clara está dividiendo a la comunidad entre aceleracionistas y proteccionistas."
          },
          { id: "e2", name: "Formatos Híbridos", badge: "Consolidado", color: "bg-cyan-500", text: "text-cyan-600", why: "Normalizado tras 2 años de debate.",
            kpis: [{ label: "Tracción", value: "Media" }, { label: "Acuerdo", value: "88%" }, { label: "Fricción", value: "Baja" }],
            conclusion: "El debate terminó. El ecosistema asume este modelo como el estándar definitivo a largo plazo."
          }
        ],
        ctaText: "Aportar visión ahora",
        ctaRoute: "/actualidad"
      };
    // Default fallback (ALL o Profesor/Lugares)
    default:
       return {
        title: "Entidad Protagonista Oculta",
        entities: [
          { id: "e1", name: "El Factor Confianza", badge: "Transversal", color: "bg-indigo-500", text: "text-indigo-600", why: "Eje invisible que cruza todos los módulos.",
            kpis: [{ label: "Correlación", value: "0.92" }, { label: "Impacto", value: "Crítico" }, { label: "Latencia", value: "Alta" }],
            conclusion: "Independientemente del módulo, la seguridad transaccional define qué entidad gana a largo plazo."
          },
          { id: "e2", name: "Efecto Precio", badge: "Cíclico", color: "bg-amber-500", text: "text-amber-600", why: "Gana relevancia en cierres de trimestre.",
            kpis: [{ label: "Correlación", value: "0.85" }, { label: "Impacto", value: "Inmediato" }, { label: "Latencia", value: "Baja" }],
            conclusion: "Actúa como un catalizador a corto plazo, alterando temporalmente las preferencias reales de marca."
          }
        ],
        ctaText: "Analizar contexto completo",
        ctaRoute: "/hub"
      };
  }
};

export function ResultsFeaturedXRay({ activeModule, snapshot: _snapshot, activeGeneration }: ResultsFeaturedXRayProps) {
  const data = getXRayData(activeModule);
  const [activeEntityId, setActiveEntityId] = useState(data.entities[0].id);
  const navigate = useNavigate();

  const activeEntity = data.entities.find(e => e.id === activeEntityId) || data.entities[0];

  return (
    <div className="container-ws py-12 md:py-20">
      
      {/* Header Radiografía */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
        <div className="max-w-xl">
           <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 mb-4 shadow-sm">
             <ScanSearch className="w-4 h-4 text-indigo-600" />
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-700">
               Radiografía Destacada
             </span>
           </div>
          <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-3">
            {data.title}
          </h3>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Doble clic profundo en los actores que están redefiniendo las reglas del ecosistema <strong className="text-slate-800">{activeGeneration}</strong> en este momento.
          </p>
        </div>

        {/* Entity Selector (Tabs visuales premium) */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner self-start md:self-end">
          {data.entities.map(entity => (
            <button
              key={entity.id}
              onClick={() => setActiveEntityId(entity.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                activeEntityId === entity.id 
                  ? `${entity.text} bg-white shadow-sm ring-1 ring-slate-900/5` 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2 z-10">
                {activeEntityId === entity.id && <Sparkles className="w-3.5 h-3.5" />}
                {entity.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEntity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row"
        >
          
          {/* Col 1: Perfil y Conclusión (Izquierda) */}
          <div className="w-full lg:w-5/12 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 relative bg-slate-50/20">
             
             {/* Tag contextual */}
             <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white mb-8 ${activeEntity.color}`}>
               <CheckCircle2 className="w-3 h-3" />
               {activeEntity.badge}
             </div>

             <h4 className="text-4xl md:text-5xl font-black text-ink leading-[1.1] mb-4">
               {activeEntity.name}
             </h4>
             
             <p className={`text-base font-bold ${activeEntity.text} mb-8 pb-8 border-b border-slate-100`}>
               {activeEntity.why}
             </p>

             {/* KPIs Mini Grid */}
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
               {activeEntity.kpis.map((kpi, idx) => (
                 <div key={idx} className="flex flex-col">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</span>
                   <span className="text-xl font-black text-slate-800">{kpi.value}</span>
                 </div>
               ))}
             </div>

             {/* Insight Conclusion Block */}
             <div className={`p-6 rounded-2xl ${activeEntity.color.replace('bg-', 'bg-').replace('500', '50')} border border-slate-200/50 mt-auto`}>
               <h5 className={`text-xs font-black uppercase tracking-widest mb-2 ${activeEntity.text}`}>Micro-Conclusión</h5>
               <p className="text-sm font-medium text-slate-700 leading-relaxed">
                 {activeEntity.conclusion}
               </p>
             </div>
             
             <button 
               onClick={() => navigate(data.ctaRoute)}
               className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
             >
               {data.ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {/* Col 2: Híbrido Visual Atributos + Evolución (Derecha) */}
          <div className="w-full lg:w-7/12 p-8 md:p-12 relative overflow-hidden bg-white flex flex-col justify-center items-center min-h-[400px]">
            <div className="absolute inset-0 z-0 bg-slate-50/50" />
            
            {/* Visual Explicativo (Híbrido) */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center gap-12">
              
              {/* Radar simulado de atributos y fuerza */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Geometrías de fondo */}
                <Hexagon className="absolute w-full h-full text-slate-100 stroke-[0.5]" />
                <Hexagon className="absolute w-48 h-48 text-slate-100 stroke-[1]" />
                <Hexagon className="absolute w-32 h-32 text-slate-200 stroke-[1.5]" />
                
                {/* Conexiones híbridas */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
                    <motion.polygon 
                      points="50,10 90,40 70,90 30,90 10,40"
                      fill={activeEntity.id === 'e1' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                      stroke={activeEntity.id === 'e1' ? '#6366f1' : '#ef4444'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.polygon 
                      points="50,25 75,50 65,75 35,75 25,50"
                      fill={activeEntity.id === 'e1' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.4)'}
                      stroke={activeEntity.id === 'e1' ? '#4f46e5' : '#dc2626'}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    />
                    {/* Data Points */}
                    <circle cx="50" cy="10" r="2" fill="currentColor" className="text-slate-800" />
                    <circle cx="90" cy="40" r="2" fill="currentColor" className="text-slate-800" />
                    <circle cx="70" cy="90" r="2" fill="currentColor" className="text-slate-800" />
                    <circle cx="30" cy="90" r="2" fill="currentColor" className="text-slate-800" />
                    <circle cx="10" cy="40" r="2" fill="currentColor" className="text-slate-800" />
                  </svg>
                </div>

                {/* Etiquetas de atributos flotantes */}
                <span className="absolute -top-6 text-[10px] font-bold text-slate-500 uppercase">Impacto</span>
                <span className="absolute -right-12 top-10 text-[10px] font-bold text-slate-500 uppercase">Afinidad</span>
                <span className="absolute -right-6 bottom-4 text-[10px] font-bold text-slate-500 uppercase">Retención</span>
                <span className="absolute -left-6 bottom-4 text-[10px] font-bold text-slate-500 uppercase">Costo</span>
                <span className="absolute -left-12 top-10 text-[10px] font-bold text-slate-500 uppercase">Tracción</span>
              </div>

              {/* Minigráfico de tendencia inferior */}
              <div className="w-full max-w-sm mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Evolución 90D
                  </span>
                  <span className="text-xs font-black text-slate-800">Momento en Pico</span>
                </div>
                <div className="w-full h-8 flex items-end gap-1">
                  {[...Array(24)].map((_, i) => {
                    // Genera una curva de tendencia visualmente agradable
                    const trend = activeEntity.id === 'e1' 
                      ? Math.sin(i / 3) * 20 + i * 2 + 20 
                      : Math.cos(i / 4) * 15 + (24 - i) * 1.5 + 30;
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        animate={{ height: `${trend}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02 }}
                        className={`flex-1 rounded-t-sm ${i > 18 ? activeEntity.color : 'bg-slate-200'}`} 
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
