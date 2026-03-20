export function ResultsConsensusMapB2C() {
  return (
    <section className="mb-16 md:mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Campo de Fuerzas del Ecosistema</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Visualiza cómo gravitan las opiniones sobre los temas que definen nuestra época. El tamaño indica el volumen de señal.</p>
      </div>
      <div className="relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden p-8 flex items-center justify-center border border-slate-200 shadow-sm">
        {/* Static Background Grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <div className="w-[80%] h-[80%] border border-slate-200 rounded-full"></div>
          <div className="w-[60%] h-[60%] border border-slate-200 rounded-full absolute"></div>
          <div className="w-[40%] h-[40%] border border-slate-200 rounded-full absolute"></div>
        </div>
        {/* Bubble Map Layout */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {/* Sostenibilidad */}
          <div className="absolute top-[10%] left-[20%] w-[180px] h-[180px] rounded-full bg-white border border-emerald-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 hover:z-20 transition-all duration-300 cursor-pointer group/bubble">
             <div className="absolute inset-0 bg-emerald-50 rounded-full opacity-50"></div>
             <div className="relative flex flex-col items-center">
               <span className="material-symbols-outlined text-emerald-600 text-4xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
               <span className="text-slate-900 font-bold text-xl">Sostenibilidad</span>
               <span className="text-xl font-black text-emerald-600">92%</span>
               <span className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">CONSENSO TOTAL</span>
             </div>
          </div>

          {/* Consumo Local */}
          <div className="absolute bottom-[20%] right-[15%] w-[150px] h-[150px] rounded-full bg-white border border-blue-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 hover:z-20 transition-all duration-300 cursor-pointer group/bubble">
             <div className="absolute inset-0 bg-blue-50 rounded-full opacity-50"></div>
             <div className="relative flex flex-col items-center">
               <span className="material-symbols-outlined text-primary text-3xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
               <span className="text-slate-900 font-bold text-lg">Consumo</span>
               <span className="text-lg font-bold text-primary">78%</span>
               <span className="text-[10px] text-slate-500 font-bold mt-1">ALTO FLUJO</span>
             </div>
          </div>
          
          {/* Política */}
          <div className="absolute top-[35%] right-[30%] w-[120px] h-[120px] rounded-full bg-white border border-orange-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 hover:z-20 transition-all duration-300 cursor-pointer group/bubble">
             <div className="absolute inset-0 bg-orange-50 rounded-full opacity-50"></div>
             <div className="relative flex flex-col items-center">
               <span className="material-symbols-outlined text-orange-500 text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
               <span className="text-slate-900 font-bold">Política</span>
               <span className="text-sm font-bold text-orange-500">50/50</span>
               <span className="text-[10px] text-slate-500 font-bold mt-1 text-center leading-tight">MÁXIMA POLARIDAD</span>
             </div>
          </div>

          {/* Educación */}
          <div className="absolute bottom-[10%] left-[30%] w-[100px] h-[100px] rounded-full bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 hover:z-20 transition-all duration-300 cursor-pointer group/bubble">
             <div className="absolute inset-0 bg-slate-50 rounded-full opacity-50"></div>
             <div className="relative flex flex-col items-center">
               <span className="text-slate-900 font-bold text-sm">Educación</span>
               <span className="text-xs font-bold text-slate-500">65%</span>
               <span className="text-[8px] text-slate-400 font-bold mt-0.5">ESTABLE</span>
             </div>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Consenso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tensión</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
