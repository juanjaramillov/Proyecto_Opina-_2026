import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { motion } from 'framer-motion';

interface Props {
  snapshot: MasterHubSnapshot;
}

export function ResultsPersonalXRay({ snapshot }: Props) {
  const total = snapshot.overview.totalSignals;
  
  // Nivel de diferenciación (Mock para B2C V2)
  const diffLevel: 'Bajo' | 'Medio' | 'Alto' = 'Alto';
  
  // Configuración de las formas animadas de fondo basada en la diferenciación
  const bgConfig = {
    Bajo: { spread: 20, duration: 8, scale: [1, 1.05, 1] },
    Medio: { spread: 50, duration: 6, scale: [1, 1.1, 1] },
    Alto: { spread: 100, duration: 4, scale: [1, 1.2, 1] }
  }[diffLevel];

  // Colores Premium para las formas abstractas
  const shapeColors = ['bg-indigo-300', 'bg-emerald-300', 'bg-rose-300'];

  return (
    <section className="relative w-full bg-slate-50 overflow-hidden min-h-[85vh] flex items-center justify-center border-b border-slate-100 py-24 px-6">
      
      {/* Capa Visual: Abstract Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        {shapeColors.map((color, i) => (
          <motion.div
            key={i}
            className={`absolute w-64 h-64 md:w-96 md:h-96 rounded-full opacity-30 mix-blend-multiply blur-[80px] ${color}`}
            animate={{
              x: [0, (i % 2 === 0 ? 1 : -1) * bgConfig.spread + Math.random() * 50, 0],
              y: [0, (i % 3 === 0 ? 1 : -1) * bgConfig.spread + Math.random() * 50, 0],
              scale: bgConfig.scale,
            }}
            transition={{
              duration: bgConfig.duration + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col items-center text-center">
        
        {/* Sello (Badge): Nivel de diferenciación */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-indigo-900/5 border border-indigo-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
        >
          <div className={`w-2 h-2 rounded-full ${diffLevel === 'Alto' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'}`} />
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-700">
            Nivel de Diferenciación: {diffLevel}
          </span>
        </motion.div>

        {/* Frase Principal Grande y Protagonista */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6"
        >
          Tus señales revelan una <br className="hidden md:block"/> perspectiva única.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-slate-600 font-medium mb-16 max-w-2xl"
        >
          Basado en tus <span className="text-slate-900 font-bold">{total} decisiones</span>, hemos mapeado cómo te relacionas con el ecosistema de Opina+.
        </motion.p>

        {/* Dos polos: Dónde encajas y Dónde rompes */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          {/* Dónde encajas */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left flex flex-col">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">join_inner</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Dónde encajas</h3>
            <p className="text-slate-500 mb-8 font-medium">Temas donde eres la voz de la mayoría.</p>
            <ul className="mt-auto space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Hábitos y Consumo (85%)
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Estilo de Vida (72%)
              </li>
            </ul>
          </div>

          {/* Dónde rompes */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-left flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[8rem] text-white">call_split</span>
            </div>
            <div className="relative z-10 w-14 h-14 bg-white/10 text-white rounded-[1.25rem] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">alt_route</span>
            </div>
            <h3 className="relative z-10 text-2xl font-black text-white mb-2">Dónde rompes</h3>
            <p className="relative z-10 text-slate-400 mb-8 font-medium">Donde marcas clara distancia del consenso.</p>
            <ul className="relative z-10 mt-auto space-y-4">
               <li className="flex items-center gap-3 text-sm font-bold text-slate-100 bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                Política y Sociedad (91% divergente)
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-100 bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                Tecnología (65% divergente)
              </li>
            </ul>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
