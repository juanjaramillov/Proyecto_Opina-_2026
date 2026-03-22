import { Link } from 'react-router-dom';

export default function WhatIsOpinaSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
      {/* Decoración ambiental sutil */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
            Inteligencia Colectiva
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-ink mb-6 tracking-tight">
            ¿Qué es <span className="text-blue-600">Opina+</span>?
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Una plataforma donde tu voz tiene peso. Aporta tus opiniones, descubre cómo piensa el resto y recibe valor a cambio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Línea conectora (visible en desktop) */}
          <div className="hidden md:block absolute top-[48px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-emerald-100 to-orange-100 z-0" />

          {/* Paso 1 */}
          <Link to="/signals" className="relative z-10 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-blue-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-blue-500 relative z-10 group-hover:scale-110 transition-transform duration-300">touch_app</span>
            </div>
            <div className="bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">1. Participa</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-blue-600 transition-colors">Aporta tus señales</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Responde dinámicas rápidas y entretenidas. Cada voto, cada elección es una señal que suma a la inteligencia colectiva.
            </p>
          </Link>

          {/* Paso 2 */}
          <Link to="/results" className="relative z-10 flex flex-col items-center text-center group mt-4 md:mt-0 cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-emerald-500 relative z-10 group-hover:scale-110 transition-transform duration-300">donut_small</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">2. Descubre</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-emerald-600 transition-colors">Compara y entiende</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Accede a resultados instantáneos. Descubre macro tendencias y compárate con miles de personas en tiempo real.
            </p>
          </Link>

          {/* Paso 3 */}
          <Link to="/profile" className="relative z-10 flex flex-col items-center text-center group mt-4 md:mt-0 cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-orange-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-orange-500 relative z-10 group-hover:scale-110 transition-transform duration-300">redeem</span>
            </div>
            <div className="bg-orange-50 text-orange-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">3. Gana</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-orange-600 transition-colors">Obtén recompensas</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Mantén tu racha, sube de nivel y desbloquea beneficios exclusivos por tu aporte constante a la plataforma.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
