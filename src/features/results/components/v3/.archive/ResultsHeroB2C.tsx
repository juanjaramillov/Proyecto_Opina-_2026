export function ResultsHeroB2C() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
      <div className="space-y-6">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
          Resultados Actualizados
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          El Pulso de la <br /> <span className="text-primary">Comunidad</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
          Donde cada señal cuenta. Explora las tensiones, consensos y el flujo del pensamiento colectivo.
        </p>
        
        {/* Datos Globales */}
        <div className="flex flex-wrap gap-6 mt-8 border-y border-slate-200 py-6">
          <div>
            <p className="text-3xl font-black text-slate-900">24.5k</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Señales Hoy</p>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div>
            <p className="text-3xl font-black text-primary">96%</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Precisión</p>
          </div>
          <div className="w-px hidden sm:block bg-slate-200"></div>
          <div>
            <p className="text-3xl font-black text-emerald-600">12</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Polos de Tensión</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-600 text-sm">sensors</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Relevancia</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Tecnología Cuántica</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consenso</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Sostenibilidad</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-orange-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-orange-500 text-sm">bolt</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tensión</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Regulación de IA</p>
          </div>
        </div>
      </div>
      
      {/* Clean Hero Illustration */}
      <div className="relative flex justify-center items-center h-full min-h-[400px]">
        {/* Soft abstract rings */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] border border-slate-200 rounded-full animate-[spin_20s_linear_infinite] border-dashed"></div>
           <div className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] border border-blue-100 rounded-full"></div>
           <div className="absolute w-[100px] h-[100px] md:w-[160px] md:h-[160px] bg-blue-50 rounded-full flex items-center justify-center shadow-sm border border-blue-100 z-10">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
           </div>
           
           {/* Floating Cards */}
           <div className="absolute top-10 right-4 lg:right-10 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm z-20 flex items-center gap-3 animate-bounce">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Flujo Activo</span>
                <span className="text-sm font-black text-slate-900 leading-none">+1,200/min</span>
              </div>
           </div>

           <div className="absolute bottom-20 left-0 md:left-10 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm z-20 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-lg">trending_up</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Tendencia Alta</span>
                <span className="text-sm font-black text-slate-900 leading-none">Ética Digital</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
