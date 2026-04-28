import { Link } from 'react-router-dom';
import { MousePointerClick, Sparkles, PieChart, TrendingUp, Gift, Coins } from 'lucide-react';
import { GradientText } from '../../../components/ui/foundation';

export default function WhatIsOpinaSection() {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-stroke relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Empieza a Jugar
          </div>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-ink mb-6 tracking-tight">
            ¿Cómo funciona <GradientText>Opina+</GradientText>?
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La red donde tu opinión moldea el futuro. Participa en dinámicas divertidas, compárate con miles de personas y sube de nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative mt-12">
          {/* Línea conectora animada (visible en desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-1 bg-slate-200 z-0 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-brand to-accent opacity-80 animate-flow-line" />
          </div>

          {/* Paso 1: Participa */}
          <Link to="/signals" className="relative z-10 flex flex-col items-center text-center group cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              {/* Pedestal Claymorphism */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-5xl shadow-paper-brand border-t-2 border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow">
                <MousePointerClick className="w-14 h-14 text-brand-500 drop-shadow-[0_4px_8px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute top-8 right-8 w-6 h-6 text-brand-400 drop-shadow-sm animate-float-fast" />
              </div>
            </div>
            
            <div className="bg-white text-brand-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-slate-100 shadow-sm">
              1. Participa
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-brand-600 transition-colors">Hazte Escuchar</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base">
              Vota en versus rápidos y deja tu marca en los debates más candentes de la semana.
            </p>
          </Link>

          {/* Paso 2: Descubre */}
          <Link to="/results" className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0 cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              {/* Pedestal Claymorphism */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-5xl shadow-paper-accent border-t-2 border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow" style={{ animationDelay: '0.4s' }}>
                <PieChart className="w-14 h-14 text-accent drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform duration-300" />
                <TrendingUp className="absolute bottom-8 right-8 w-6 h-6 text-accent-400 drop-shadow-sm animate-float-fast" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>

            <div className="bg-white text-accent-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-slate-100 shadow-sm">
              2. Descubre
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-accent transition-colors">Dónde Estás</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base">
              Mira los resultados en tiempo real y descubre si estás con la mayoría o eres la excepción.
            </p>
          </Link>

          {/* Paso 3: Gana */}
          <Link to="/profile" className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0 cursor-pointer">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10">
              {/* Pedestal Claymorphism */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-5xl shadow-paper-brand border-t-2 border-white flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-4 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                <Gift className="w-14 h-14 text-brand drop-shadow-[0_4px_8px_rgba(37,99,235,0.4)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                <Coins className="absolute top-6 left-6 w-7 h-7 text-accent drop-shadow-sm animate-float-fast" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute bottom-8 right-6 w-5 h-5 text-accent-400 drop-shadow-sm animate-pulse" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand to-accent text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-transparent shadow-sm">
              3. Gana
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 group-hover:text-brand-600 transition-colors">Sube de Nivel</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-base">
              Gana XP con cada interacción, escala en el ranking global y desbloquea recompensas exclusivas.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
