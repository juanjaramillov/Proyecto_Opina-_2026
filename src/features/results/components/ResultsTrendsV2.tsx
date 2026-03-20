import { motion } from 'framer-motion';
import { ResultsModule, ResultsPeriod } from "./hub/FilterBar";

interface ResultsTrendsV2Props {
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
}

export function ResultsTrendsV2({ activePeriod }: ResultsTrendsV2Props) {
  return (
    <section className="w-full bg-white py-16 md:py-24 border-b border-slate-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          
          {/* Lado izquierdo: Gráfico abstracto SVG */}
          <div className="flex-1 w-full bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 flex items-center justify-center relative min-h-[300px] overflow-hidden">
            {/* Grid abstracto muy sutil, no un eje técnico */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} 
            />

            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible z-10">
              
              {/* Línea de previsión / tensión futura */}
              <path d="M 380 20 C 400 20, 420 0, 440 -20" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />

              {/* Sombra de la línea */}
              <motion.path
                d="M 20 160 C 100 160, 150 40, 240 80 C 310 110, 350 20, 380 20"
                fill="none"
                stroke="url(#gradientShadow)"
                strokeWidth="24"
                strokeLinecap="round"
                className="opacity-30 blur-xl"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Línea principal vibrante */}
              <motion.path
                d="M 20 160 C 100 160, 150 40, 240 80 C 310 110, 350 20, 380 20"
                fill="none"
                stroke="url(#gradientMain)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Hitos / Nodos de la trayectoria */}
              <motion.circle cx="150" cy="98" r="4" fill="#a5b4fc"
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
              />
              <motion.circle cx="240" cy="80" r="4" fill="#818cf8"
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}
              />
              
              {/* Indicador de lectura secundaria en nodo 1 */}
              <motion.g initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <text x="130" y="120" fontSize="10" fontWeight="bold" fill="#64748b" className="uppercase tracking-widest">Estabiliza</text>
              </motion.g>

              {/* Indicador de lectura en nodo final */}
               <motion.g initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 }}>
                 <rect x="280" y="-10" width="80" height="20" rx="10" fill="#fee2e2" />
                 <circle cx="290" cy="0" r="3" fill="#ef4444" />
                <text x="300" y="3" fontSize="9" fontWeight="bold" fill="#dc2626" className="uppercase tracking-wider">Zona caliente</text>
              </motion.g>

              {/* Punto final animado vibrante */}
              <motion.circle
                cx="380"
                cy="20"
                r="10"
                fill="#fff"
                stroke="#6366f1"
                strokeWidth="5"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 15 }}
                className="drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]"
              />
              <motion.circle
                cx="380"
                cy="20"
                r="16"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ delay: 1.4, repeat: Infinity, duration: 1.5 }}
              />
              
              <defs>
                <linearGradient id="gradientShadow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="gradientMain" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Lado derecho: Frase e insights */}
          <div className="flex-1 w-full text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 mb-5">
               <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                 Aceleración de Interés — {activePeriod === "7D" ? "Últimos 7 Días" : activePeriod === "30D" ? "Últimas 4 Semanas" : "Últimos 3 Meses"}
               </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              El interés por temas sostenibles está acelerando.
            </h2>

            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Crecimiento sostenido</h4>
                  <p className="text-slate-600 text-sm font-medium">La conversación sobre huella de carbono subió un 42% en el último mes.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Caída en interés táctico</h4>
                  <p className="text-slate-600 text-sm font-medium">Búsquedas sobre "reciclaje básico" ceden ante "economía circular avanzada".</p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
