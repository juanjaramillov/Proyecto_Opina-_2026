export function ResultsProfileVsCommunityB2C() {
  return (
    <section className="mb-16 md:mb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Profile Signal */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-8 md:p-10 shadow-sm flex flex-col justify-between border border-slate-200">
          <div>
            <span className="text-slate-500 font-bold tracking-widest text-[10px] uppercase block mb-4">Análisis Comparativo</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-8">
              Tu Perfil: <br /><span className="text-primary">Vanguardia Social</span>
            </h2>
            {/* Radar Chart */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-full h-full border border-slate-900 rounded-full"></div>
                <div className="w-3/4 h-3/4 border border-slate-900 rounded-full absolute"></div>
                <div className="w-1/2 h-1/2 border border-slate-900 rounded-full absolute"></div>
              </div>
              {/* Organic Radar Shape */}
              <svg className="w-4/5 h-4/5 transform -rotate-12 overflow-visible" viewBox="0 0 100 100">
                <path d="M50 10 L85 30 L90 70 L50 90 L10 70 L15 30 Z" fill="none" stroke="#24389c" strokeDasharray="2 2" strokeWidth="0.5"></path>
                <path d="M50 20 L75 35 L80 65 L50 80 L20 65 L25 35 Z" fill="rgba(36, 56, 156, 0.1)" stroke="#24389c" strokeWidth="2"></path>
                <circle cx="50" cy="20" fill="#24389c" r="2.5"></circle>
                <circle cx="75" cy="35" fill="#24389c" r="2.5"></circle>
                <circle cx="80" cy="65" fill="#24389c" r="2.5"></circle>
                <circle cx="50" cy="80" fill="#24389c" r="2.5"></circle>
                <circle cx="20" cy="65" fill="#24389c" r="2.5"></circle>
                <circle cx="25" cy="35" fill="#24389c" r="2.5"></circle>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 mt-6">
               <div>
                  <p className="text-3xl font-black text-slate-900">12</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Dimensiones</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-primary">Top 5%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Extensión de Perfil</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Insights */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          <div className="bg-white rounded-xl p-6 sm:p-8 hover:-translate-y-1 transition-transform border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-bold text-slate-900">Coincides más en Consumo</h3>
                <span className="text-3xl font-black text-emerald-600 leading-none">72%</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Tus patrones de gasto y elección de marcas están estrechamente alineados con la mayoría.</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 sm:p-8 hover:-translate-y-1 transition-transform border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-bold text-slate-900">Te diferencias en Valores</h3>
                <span className="text-3xl font-black text-blue-600 leading-none">40%</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Tu visión sobre ética empresarial es significativamente más disruptiva que el promedio general.</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-600 rounded-l-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 sm:p-8 hover:-translate-y-1 transition-transform border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-bold text-slate-900">Polaridad en Política Local</h3>
                <span className="text-3xl font-black text-orange-500 leading-none">12%</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Tus opiniones políticas pertenecen a una minoría demográfica emergente.</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-orange-500 rounded-l-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary rounded-xl p-8 text-white relative overflow-hidden group mt-2 flex-grow flex items-center shadow-md">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div>
                <h4 className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-2">Índice Total de Afinidad</h4>
                <p className="text-3xl md:text-4xl font-black tracking-tight">85.4% de Coincidencia</p>
              </div>
              <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm tracking-wide shadow-sm flex-shrink-0">
                VER COMPARADOR
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
