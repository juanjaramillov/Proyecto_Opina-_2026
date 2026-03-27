import { Zap, ChevronRight, Trophy, Swords, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ResultsVersusBlock() {
  return (
    <section className="w-full bg-slate-950 text-white mt-12 py-16 px-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 mb-10">
           <div className="max-w-2xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                 <Zap className="w-5 h-5 text-rose-400" />
               </div>
               <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                 QUÉ ESTÁ ELIGIENDO LA GENTE
               </span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
               Decisiones de Compra
             </h2>
             <p className="text-base md:text-xl font-medium text-slate-400 leading-relaxed">
               Qué factores están haciendo que las personas elijan una opción sobre otra hoy mismo.
             </p>
           </div>
           
           <button className="shrink-0 flex items-center gap-2 text-xs font-bold text-white hover:text-rose-400 transition-colors uppercase tracking-widest bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
             Ver Matriz Completa <ChevronRight className="w-4 h-4" />
           </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Col: Dominio Conceptos (Cols 1 to 5) */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="mb-8 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xl font-black text-white leading-none">Lo que más importa hoy</h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">Lo que la mayoría de compradores exige</p>
                </div>
             </div>

             <div className="space-y-8 flex-1">
               {/* Item 1 */}
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="text-4xl font-black text-amber-400 tracking-tighter leading-none">1</span>
                       <div className="flex flex-col">
                         <span className="font-black text-white text-lg leading-none">Bajar sus gastos</span>
                         <span className="text-[10px] flex items-center gap-1 text-emerald-400 uppercase tracking-widest font-bold mt-1">
                           <TrendingUp className="w-3 h-3" /> +12% de personas lo exigen más
                         </span>
                       </div>
                    </div>
                    <div className="font-black text-3xl text-white tracking-tighter">58<span className="text-xl text-slate-500">%</span></div>
                 </div>
                 <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '58%' }} />
                 </div>
               </div>

               {/* Item 2 */}
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="text-3xl font-black text-slate-500 tracking-tighter leading-none">2</span>
                       <div className="flex flex-col">
                         <span className="font-black text-slate-200 text-base leading-none">Comprar rápido y cerca</span>
                         <span className="text-[10px] flex items-center gap-1 text-slate-400 uppercase tracking-widest font-bold mt-1">
                           <Minus className="w-3 h-3" /> Sin cambios recientes
                         </span>
                       </div>
                    </div>
                    <div className="font-black text-2xl text-slate-200 tracking-tighter">51<span className="text-lg text-slate-500">%</span></div>
                 </div>
                 <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '51%' }} />
                 </div>
               </div>

               {/* Item 3 */}
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-slate-600 tracking-tighter leading-none">3</span>
                       <div className="flex flex-col">
                         <span className="font-black text-slate-300 text-sm leading-none">Que sea ecológico</span>
                         <span className="text-[9px] flex items-center gap-1 text-rose-400 uppercase tracking-widest font-bold mt-1">
                           <TrendingDown className="w-3 h-3" /> Perdiendo interés frente al precio
                         </span>
                       </div>
                    </div>
                    <div className="font-black text-xl text-slate-300 tracking-tighter">42<span className="text-base text-slate-600">%</span></div>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '42%' }} />
                 </div>
               </div>
             </div>

             {/* Insight Box */}
             <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mt-8 backdrop-blur-md">
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                 <p className="text-sm font-medium text-slate-300">
                   <strong className="text-white font-black">El precio manda:</strong> las personas están priorizando el ahorro agresivo frente a cualquier otro beneficio en todas las categorías.
                 </p>
               </div>
             </div>
          </div>

          {/* Right Col: Duelos Conceptuales (Cols 6 to 12) */}
          <div className="lg:col-span-7 flex flex-col">
             <div className="mb-8 flex items-center gap-3">
                <Swords className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-xl font-black text-white leading-none">Puntos de Tensión</h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">Dónde las personas están cambiando de opinión</p>
                </div>
             </div>

             <div className="flex flex-col gap-4">
               {/* Featured Duel (Most Competitive) */}
               <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/10 blur-[50px] pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex flex-col">
                     <span className="px-3 py-1 bg-rose-500/20 text-rose-400 w-max text-[10px] uppercase font-black tracking-widest rounded-full border border-rose-500/30 mb-2">
                       Decisión Dividida
                     </span>
                     <span className="text-xs font-bold text-slate-500">Quién: Clase media trabajadora</span>
                   </div>
                   
                   {/* Sparkline Decorativo */}
                   <div className="hidden md:flex flex-col items-end opacity-60">
                     <span className="text-[9px] font-bold uppercase text-emerald-400 mb-1">Cambiando rápido</span>
                     <svg width="40" height="15" viewBox="0 0 40 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M1 12L10 8L15 10L25 3L30 6L39 1" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                   </div>
                 </div>

                 <div className="flex items-center justify-between gap-6 relative">
                   {/* Left Concept */}
                   <div className="flex flex-col items-center flex-1 z-10">
                     <div className="text-2xl md:text-3xl font-black text-white mb-2 text-center tracking-tight leading-tight">Canales<br/>Digitales</div>
                     <div className="text-rose-400 font-black flex items-baseline gap-1">
                       <span className="text-4xl md:text-5xl tracking-tighter">51</span>
                       <span className="text-xl">%</span>
                     </div>
                   </div>

                   {/* VS Badge */}
                   <div className="shrink-0 flex flex-col items-center justify-center z-10">
                     <div className="w-12 h-12 bg-slate-900 border-4 border-slate-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 relative">
                       <span className="text-xs font-black text-slate-400 italic">VS</span>
                     </div>
                     <div className="absolute w-px h-full bg-white/10 left-1/2 -translate-x-1/2 z-0" />
                   </div>

                   {/* Right Concept */}
                   <div className="flex flex-col items-center flex-1 z-10">
                     <div className="text-2xl md:text-3xl font-black text-slate-400 mb-2 text-center tracking-tight leading-tight">Atención<br/>Humana</div>
                     <div className="text-slate-500 font-black flex items-baseline gap-1">
                       <span className="text-4xl md:text-5xl tracking-tighter">49</span>
                       <span className="text-xl">%</span>
                     </div>
                   </div>
                 </div>

                 <div className="w-full flex h-3 bg-slate-800 rounded-full mt-8 overflow-hidden">
                   <div className="h-full bg-rose-500" style={{ width: '51%' }} />
                   <div className="h-full bg-slate-700" style={{ width: '49%' }} />
                 </div>
                 
                 <div className="mt-4 flex justify-between items-center text-xs">
                   <p className="text-slate-400 font-medium">Mitad y mitad: las personas no se deciden aún.</p>
                   <p className="text-emerald-400 font-bold flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" /> Las apps superan a tiendas físicas
                   </p>
                 </div>
               </div>

               {/* Secondary Duels */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Duel 1 */}
                 <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                   <div className="absolute right-0 top-0 h-full w-1 bg-rose-500" />
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Calidad vs Precio</div>
                   <div className="flex items-center justify-between mb-3">
                     <span className="font-black text-white text-lg leading-tight">Mejor<br/>Calidad</span>
                     <span className="font-black text-rose-400 text-lg">56%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-slate-400 text-sm leading-tight">Tallas<br/>y Ofertas</span>
                     <span className="font-bold text-slate-500 text-sm">44%</span>
                   </div>
                   <div className="w-full flex h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden mb-2">
                     <div className="h-full bg-rose-500" style={{ width: '56%' }} />
                     <div className="h-full bg-slate-600" style={{ width: '44%' }} />
                   </div>
                   <p className="text-[10px] text-emerald-400 font-medium mt-3">+6% de personas dispuestas a pagar más si dura más</p>
                 </div>

                 {/* Duel 2 */}
                 <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                   <div className="absolute right-0 top-0 h-full w-1 bg-slate-600" />
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Qué compran</div>
                   <div className="flex items-center justify-between mb-3">
                     <span className="font-black text-white text-lg leading-tight">Marcas<br/>Nuevas</span>
                     <span className="font-black text-slate-300 text-lg">45%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-slate-400 text-sm leading-tight">Marcas<br/>De Siempre</span>
                     <span className="font-bold text-rose-400 text-sm">55%</span>
                   </div>
                   <div className="w-full flex h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden mb-2">
                     <div className="h-full bg-slate-500" style={{ width: '45%' }} />
                     <div className="h-full bg-rose-500" style={{ width: '55%' }} />
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium mt-3">Prefieren lo conocido para no arriesgar plata extra</p>
                 </div>
               </div>
             </div>

          </div>

        </div>
      </div>
    </section>
  );
}
