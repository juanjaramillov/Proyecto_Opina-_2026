import { motion } from 'framer-motion';

export function ResultsTrendsV2() {
  return (
    <section className="w-full bg-white py-16 md:py-24 border-b border-slate-100 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          
          {/* Lado izquierdo: Gráfico abstracto SVG */}
          <div className="flex-1 w-full bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 flex items-center justify-center relative min-h-[300px] overflow-hidden">
            {/* Grid abstracto muy sutil, no un eje técnico */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} 
            />

            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible z-10">
              {/* Sombra de la línea */}
              <motion.path
                d="M 20 160 C 100 160, 150 40, 240 80 C 310 110, 350 20, 380 20"
                fill="none"
                stroke="url(#gradientShadow)"
                strokeWidth="24"
                strokeLinecap="round"
                className="opacity-20 blur-lg"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Línea principal vibrante */}
              <motion.path
                d="M 20 160 C 100 160, 150 40, 240 80 C 310 110, 350 20, 380 20"
                fill="none"
                stroke="#6366f1"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Punto final animado */}
              <motion.circle
                cx="380"
                cy="20"
                r="8"
                fill="white"
                stroke="#6366f1"
                strokeWidth="4"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 15 }}
              />
              
              <defs>
                <linearGradient id="gradientShadow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Lado derecho: Frase e insights */}
          <div className="flex-1 w-full text-left">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
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
