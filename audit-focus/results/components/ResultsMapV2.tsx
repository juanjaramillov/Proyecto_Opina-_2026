import { motion } from 'framer-motion';

export function ResultsMapV2() {
  // Mock data para los nodos de categorías
  const nodes = [
    { id: 'habitos', label: 'Hábitos', type: 'consensus', color: 'bg-emerald-500', x: '50%', y: '50%', size: 'w-24 h-24' },
    { id: 'estilo', label: 'Estilo de Vida', type: 'consensus', color: 'bg-teal-500', x: '40%', y: '60%', size: 'w-20 h-20' },
    { id: 'tech', label: 'Tecnología', type: 'neutral', color: 'bg-indigo-400', x: '70%', y: '30%', size: 'w-16 h-16' },
    { id: 'politica', label: 'Política', type: 'divergent', color: 'bg-rose-500', x: '85%', y: '75%', size: 'w-28 h-28' },
    { id: 'finanzas', label: 'Finanzas', type: 'divergent', color: 'bg-orange-400', x: '20%', y: '25%', size: 'w-16 h-16' },
    { id: 'entretenimiento', label: 'Ocio', type: 'neutral', color: 'bg-blue-400', x: '35%', y: '35%', size: 'w-14 h-14' },
  ];

  return (
    <section className="w-full bg-slate-900 py-20 md:py-32 relative overflow-hidden text-white border-b border-slate-800">
      
      {/* Fondo abstract con gradiente radial (Zonas de coincidencia) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Zona Centro: Consenso */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(16,185,129,0.15)_0%,_transparent_60%)]" />
        {/* Zona Exterior: Diferenciación */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(244,63,94,0.1)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(99,102,241,0.1)_0%,_transparent_70%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Leyenda y Explicación */}
        <div className="w-full md:w-1/3 mb-12 md:mb-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] mb-6">
            <span className="material-symbols-outlined text-[14px]">explore</span>
            Tu mapa de coincidencia
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Donde orbitan tus ideas.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Las categorías más cercanas al ecosistema representan tu alineación con la mayoría. Las más alejadas son tus territorios únicos.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              <span className="text-sm font-bold text-slate-300">Zona de Consenso</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full border-2 border-slate-500" />
              <span className="text-sm font-bold text-slate-300">Puntaje Neutro</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
              <span className="text-sm font-bold text-slate-300">Territorio Diferenciado</span>
            </div>
          </div>
        </div>

        {/* Lienzo del Mapa Interactivo (Nodos Flotantes) */}
        <div className="w-full md:w-2/3 h-[500px] relative bg-slate-800/20 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
          
          {/* Anillos de referencia sutiles (No ejes, solo ambientación) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 border-dashed" />

          {/* Nodos Animados */}
          {nodes.map((node, i) => (
             <motion.div
               key={node.id}
               className={`absolute ${node.size} ${node.color} rounded-full flex flex-col items-center justify-center shadow-2xl text-white cursor-pointer hover:ring-4 ring-white/30 transition-shadow`}
               style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
               animate={{
                 y: [0, -15, 0],
                 x: [0, (i % 2 === 0 ? 10 : -10), 0]
               }}
               transition={{
                 duration: 4 + i,
                 repeat: Infinity,
                 ease: "easeInOut",
                 delay: i * 0.2
               }}
             >
               {/* Efecto glass dentro del nodo */}
               <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]"></div>
               <span className="relative z-10 text-xs md:text-sm font-black whitespace-nowrap text-white drop-shadow-md">
                 {node.label}
               </span>
             </motion.div>
          ))}
          
        </div>

      </div>
    </section>
  );
}
