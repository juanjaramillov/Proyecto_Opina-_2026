import { Brain, Flame, Scale, TrendingUp, Trophy, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResultsModule, ResultsPeriod } from "./hub/FilterBar";

interface ResultsInsightWallProps {
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
}

export function ResultsInsightWall({ activeModule, activePeriod }: ResultsInsightWallProps) {
  const getInsights = () => {
    const generalInsights = [
      { id: "g1", icon: Brain, title: "La IA lidera las conversaciones", body: "El 62% señala a la Inteligencia Artificial como el tema más activo y recurrente, abriendo debates éticos profundos.", badge: "Más leído", accent: "bg-indigo-500", textAccent: "text-indigo-400" },
      { id: "g2", icon: Flame, title: "Rechazo a marcas globales", body: "El rechazo sube al 68%, el nivel mensual más alto.", badge: "En alza", accent: "bg-rose-500", textAccent: "text-rose-400" },
      { id: "g3", icon: Scale, title: "Polarización en consumo digital", body: "La conveniencia frente al control divide a los usuarios 50/50.", badge: "División", accent: "bg-amber-500", textAccent: "text-amber-400" }
    ];

    const versusInsights = [
      { id: "v1", icon: Scale, title: "Coca-Cola vs Pepsi sigue al rojo", body: "La batalla se mantiene en 52/48 y concentra la mayor tensión histórica del mes.", badge: "Fricción", accent: "bg-rose-500", textAccent: "text-rose-400" },
      { id: "v2", icon: TrendingUp, title: "Nike cede terreno", body: "La intención de compra se desplaza hacia Adidas.", badge: "Cambio de mando", accent: "bg-emerald-500", textAccent: "text-emerald-400" }
    ];

    const tournamentInsights = [
      { id: "t1", icon: Trophy, title: "iPhone 15 domina", body: "Supera sólidamente la fase de grupos del Torneo Gadgets con un 85% de favorabilidad.", badge: "Invicto", accent: "bg-amber-500", textAccent: "text-amber-400" },
      { id: "t2", icon: Flame, title: "Café de especialidad Arrasa", body: "El público gourmet domina las semifinales.", badge: "Sorpresa", accent: "bg-rose-500", textAccent: "text-rose-400" }
    ];

    const profundidadInsights = [
      { id: "p1", icon: Brain, title: "Desconfianza en políticas ambientales", body: "Las entrevistas en profundidad arrojan dudas severas sobre el 'greenwashing' corporativo en el sector retail.", badge: "Profundo", accent: "bg-indigo-500", textAccent: "text-indigo-400" }
    ];

    const actualidadInsights = [
      { id: "a1", icon: Flame, title: "Impacto en leyes de privacidad", body: "Temor generalizado ante los cambios legislativos propuestos ayer, con picos de interacción a las 20:00 hrs.", badge: "Urgente", accent: "bg-rose-500", textAccent: "text-rose-400" }
    ];

    const lugaresInsights = [
      { id: "ap1", icon: MapPin, title: "Gentrificación dispara rechazo", body: "Los usuarios señalan Roma y Condesa como focos críticos de saturación y pérdida de identidad local.", badge: "Alerta Urbana", accent: "bg-teal-500", textAccent: "text-teal-400" }
    ];

    switch(activeModule) {
      case "VERSUS": return versusInsights;
      case "TOURNAMENT": return tournamentInsights;
      case "PROFUNDIDAD": return profundidadInsights;
      case "ACTUALIDAD": return actualidadInsights;
      case "LUGARES": return lugaresInsights;
      default: return generalInsights;
    }
  };

  const insights = getInsights();
  const mainInsight = insights[0];
  const secondaryInsights = insights.slice(1, 3);

  return (
    <section className="w-full bg-ink text-white py-16 md:py-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="container-ws relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              Insight <span className="text-slate-500">Wall</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl">
              La señal más fuerte en {activeModule === "ALL" ? "la comunidad global" : activeModule.toLowerCase()} durante los {activePeriod === "7D" ? "últimos 7 días." : activePeriod === "30D" ? "últimos 30 días." : "últimos 90 días."}
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors group">
            Ver archivo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {mainInsight && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Insight (Large) */}
              <motion.article
                key={mainInsight.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-8 bg-slate-900/50 border border-slate-800 p-8 md:p-12 group cursor-pointer hover:bg-slate-800/50 transition-colors duration-500 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${mainInsight.accent}`} />
                <div className="flex justify-between items-start mb-16">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-widest ${mainInsight.accent} text-white`}>
                    {mainInsight.badge}
                  </span>
                  <mainInsight.icon className={`w-10 h-10 ${mainInsight.textAccent} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] mb-6 group-hover:text-white transition-colors">
                    {mainInsight.title}
                  </h3>
                  <p className="text-xl md:text-2xl text-slate-400 font-medium leading-snug max-w-2xl">
                    {mainInsight.body}
                  </p>
                </div>
              </motion.article>

              {/* Secondary Insights (Stacked) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {secondaryInsights.map((item, idx) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                    className="flex-1 bg-slate-900/50 border border-slate-800 p-6 md:p-8 group cursor-pointer hover:bg-slate-800/50 transition-colors duration-500 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${item.accent}`} />
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.textAccent}`}>
                        {item.badge}
                      </span>
                      <item.icon className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight leading-tight mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </motion.article>
                ))}
                
                {secondaryInsights.length === 0 && (
                   <div className="flex-1 border border-dashed border-slate-800 flex items-center justify-center p-8 text-slate-600 font-medium text-sm text-center">
                     No hay más insights críticos para este módulo en este periodo.
                   </div>
                )}
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
