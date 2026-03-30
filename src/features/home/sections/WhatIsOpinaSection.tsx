import { Link } from 'react-router-dom';
import { MousePointerClick, Sparkles, PieChart, TrendingUp, Gift, Coins } from 'lucide-react';

export default function WhatIsOpinaSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
      {/* Estilos CSS Inline para animaciones fluidas que Tailwind no trae por defecto */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }
        @keyframes flow-line {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-flow-line {
          background-size: 200% auto;
          animation: flow-line 5s linear infinite;
        }
      `}</style>

      {/* Decoración ambiental sutil */}
      <div className="absolute top-0 right-1/4 -mt-20 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            El Motor de Opina+
          </div>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-ink mb-6 tracking-tight">
            ¿Qué es <span className="text-gradient-brand">Opina+</span>?
          </h2>
          <p className="text-lg sm:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Una plataforma donde cada opinión se convierte en una señal. Participa, compara tu visión con la comunidad y desbloquea valor real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative mt-12">
          {/* Línea conectora animada (visible en desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-1 bg-slate-200 z-0 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-sky-500 opacity-80 animate-flow-line" />
          </div>

          {/* Paso 1: Participa */}
          <Link to="/signals" className="relative z-10 flex flex-col items-center text-center group cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              {/* Sombra de Pedestal/Glow */}
              <div className="absolute inset-4 bg-blue-500/30 blur-2xl rounded-full group-hover:bg-blue-500/50 transition-colors duration-500" />
              {/* Pedestal Glassmorphism */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow">
                <MousePointerClick className="w-14 h-14 text-blue-500 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute top-8 right-8 w-6 h-6 text-blue-400 animate-float-fast" />
              </div>
            </div>
            
            <div className="bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-blue-100">
              1. Participa
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-blue-600 transition-colors">Suma Señales</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">
              Responde dinámicas ágiles y comparativas semanales. Cada elección tuya alimenta nuestra base de datos colectiva.
            </p>
          </Link>

          {/* Paso 2: Descubre */}
          <Link to="/results" className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0 cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              <div className="absolute inset-4 bg-emerald-500/30 blur-2xl rounded-full group-hover:bg-emerald-500/50 transition-colors duration-500" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow" style={{ animationDelay: '0.4s' }}>
                <PieChart className="w-14 h-14 text-emerald-500 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                <TrendingUp className="absolute bottom-8 right-8 w-6 h-6 text-emerald-400 animate-float-fast" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-emerald-100">
              2. Descubre
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-emerald-600 transition-colors">Compara Visión</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">
              Accede a resultados macro. Entérate cómo piensa la comunidad y dónde te ubicas en el debate.
            </p>
          </Link>

          {/* Paso 3: Gana */}
          <Link to="/profile" className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0 cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              <div className="absolute inset-4 bg-sky-500/40 blur-2xl rounded-full group-hover:bg-sky-500/60 transition-colors duration-500" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-sky-900/10 border border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                <Gift className="w-14 h-14 text-sky-500 drop-shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                <Coins className="absolute top-6 left-6 w-7 h-7 text-sky-400 animate-float-fast" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute bottom-8 right-6 w-5 h-5 text-sky-300 animate-pulse" />
              </div>
            </div>

            <div className="bg-sky-50 text-sky-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-sky-100">
              3. Gana
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-sky-500 transition-colors">Desbloquea Valor</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">
              Tu consistencia al opinar alimenta tu perfil de usuario. Acumula prestigio, sube de nivel y diferénciate.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
