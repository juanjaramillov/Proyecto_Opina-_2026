export function ResultsTrendsB2C() {
  return (
    <section className="mb-16 md:mb-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Evolución de Señales</h2>
          <p className="text-slate-500 mt-2 text-lg">Tendencias detectadas en el último ciclo lunar.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">MES</button>
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm">SEMANA</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Evolution Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="h-64 flex items-end justify-between gap-2 relative">
            {/* Chart Lines (Simulated with div blocks/gradients) */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path d="M0 80 Q 50 20, 100 50 T 200 10 T 300 60 T 400 30" fill="none" stroke="url(#line-grad)" strokeLinecap="round" strokeWidth="4"></path>
              <defs>
                <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#24389c"></stop>
                  <stop offset="100%" stopColor="#006c49"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="z-10 w-full flex justify-between px-2 pt-60">
              <span className="text-[10px] font-bold text-slate-400">LUN</span>
              <span className="text-[10px] font-bold text-slate-400">MAR</span>
              <span className="text-[10px] font-bold text-slate-400">MIE</span>
              <span className="text-[10px] font-bold text-slate-400">JUE</span>
              <span className="text-[10px] font-bold text-slate-400">VIE</span>
              <span className="text-[10px] font-bold text-slate-400">SAB</span>
              <span className="text-[10px] font-bold text-slate-400">DOM</span>
            </div>
          </div>
        </div>
        {/* Findings List */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div>
            {/* Finding Item 1 */}
            <div className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">trending_up</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <p className="text-sm font-bold text-slate-900 leading-snug">La mayor tensión hoy está en Tecnología</p>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 whitespace-nowrap">+15% Pol.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">Hace 2 horas</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium">1,2k int.</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors self-center text-sm">arrow_forward_ios</span>
            </div>

            {/* Finding Item 2 */}
            <div className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <p className="text-sm font-bold text-slate-900 leading-snug">Sostenibilidad alcanza 88% de consenso</p>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">+5% Con.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">Hace 5 horas</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium">3,4k int.</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors self-center text-sm">arrow_forward_ios</span>
            </div>

            {/* Finding Item 3 */}
            <div className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">group_work</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <p className="text-sm font-bold text-slate-900 leading-snug">Nueva tribu emergente: "Eco-Agnósticos"</p>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 whitespace-nowrap">Nuevo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">Ayer</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium">500+ orgs.</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors self-center text-sm">arrow_forward_ios</span>
            </div>
          </div>
          
          <button className="w-full mt-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs uppercase tracking-wide">
            Ver Historial
          </button>
        </div>
      </div>
      <div className="mt-16 flex justify-center">
        <button className="bg-primary hover:bg-blue-800 text-white font-black text-sm tracking-widest px-12 py-4 rounded-xl shadow-sm transition-all uppercase">
          Explorar Más Señales
        </button>
      </div>
    </section>
  );
}
