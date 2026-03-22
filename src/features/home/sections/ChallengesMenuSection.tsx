
import { Trophy, Flame, Search, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChallengesMenuSection() {
  const challenges = [
    {
      title: "La final de marcas",
      subtitle: "Torneos",
      accentClassName: "text-emerald-500",
      pedestalGlow: "bg-emerald-500/20 group-hover:bg-emerald-500/40",
      pedestalShadow: "shadow-emerald-900/10 hover:shadow-emerald-500/20",
      icon: <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />,
      bgGradient: "from-emerald-500/10 via-emerald-400/5 to-transparent",
      borderColor: "border-slate-200 group-hover:border-emerald-400/50",
      shadowHover: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
      link: "/torneos",
      miniData: (
        <div className="flex items-center gap-1.5 bg-emerald-50 transition-colors px-3 py-2 rounded-xl border border-emerald-100 w-full justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-white animate-pulse" />
          <span className="text-emerald-700 font-bold text-[10px] xl:text-xs uppercase tracking-widest group-hover:text-white transition-colors">Torneo Activo</span>
        </div>
      ),
      decorativeBg: (
        <svg className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-[0.10] transition-all duration-1000 origin-center group-hover:animate-[spin_40s_linear_infinite]" preserveAspectRatio="none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#10b981" strokeWidth="0.5" />
        </svg>
      )
    },
    {
      title: "El debate de la semana",
      subtitle: "Actualidad",
      accentClassName: "text-sky-500",
      pedestalGlow: "bg-sky-500/20 group-hover:bg-sky-500/40",
      pedestalShadow: "shadow-sky-900/10 hover:shadow-sky-500/20",
      icon: <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-sky-500 transition-transform duration-500 group-hover:scale-125" />,
      bgGradient: "from-sky-500/10 via-sky-400/5 to-transparent",
      borderColor: "border-slate-200 group-hover:border-sky-400/50",
      shadowHover: "hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]",
      link: "/versus",
      miniData: (
        <div className="flex flex-col gap-1 w-full mt-1 px-2 border border-transparent group-hover:border-sky-100/50 rounded-lg p-1 transition-colors">
          <div className="flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-sky-600 transition-colors">
            <span>60%</span>
            <span>40%</span>
          </div>
          <div className="w-full flex h-1.5 rounded-full overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="h-full bg-blue-500 transition-all duration-1000 ease-out w-1/2 group-hover:w-[60%]" />
            <div className="h-full bg-sky-400 transition-all duration-1000 ease-out w-1/2 group-hover:w-[40%]" />
          </div>
        </div>
      ),
      decorativeBg: (
        <svg className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none group-hover:animate-[pulse_4s_ease-in-out_infinite]" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d="M0,50 Q25,20 50,50 T100,50 M0,60 Q25,30 50,60 T100,60 M0,70 Q25,40 50,70 T100,70" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      title: "Accede a la radiografía",
      subtitle: "Profundidad",
      accentClassName: "text-blue-600",
      pedestalGlow: "bg-blue-600/20 group-hover:bg-blue-600/40",
      pedestalShadow: "shadow-blue-900/10 hover:shadow-blue-600/20",
      icon: <Search className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1" />,
      bgGradient: "from-blue-600/10 via-blue-500/5 to-transparent",
      borderColor: "border-slate-200 group-hover:border-blue-500/50",
      shadowHover: "hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]",
      link: "/resultados",
      miniData: (
        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 w-full justify-center group-hover:bg-blue-600 text-blue-700 group-hover:text-white transition-all duration-300">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-bold text-[10px] xl:text-xs uppercase tracking-widest">Desbloquear Insight</span>
        </div>
      ),
      decorativeBg: (
        <svg className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-[0.08] transition-all duration-1000 origin-center group-hover:animate-[spin_60s_linear_infinite_reverse]" preserveAspectRatio="none" viewBox="0 0 100 100">
           <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                 <circle cx="2" cy="2" r="1.5" fill="#2563eb" />
              </pattern>
           </defs>
           <rect width="100" height="100" fill="url(#grid)" />
           <circle cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="0.5" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-ink mb-12 text-center md:text-left tracking-tight">
          Descubre la tendencia. <span className="text-gradient-brand">Suma tus señales a los temas del momento.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {challenges.map((challenge, idx) => (
            <Link 
              key={idx} 
              to={challenge.link}
              className={`group relative overflow-hidden rounded-[2.5rem] bg-white border shadow-sm p-8 pb-8 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center justify-between ${challenge.borderColor} ${challenge.shadowHover}`}
            >
              {/* Inner Glow Orb - Visible in hover */}
              <div className={`absolute -inset-20 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none mix-blend-overlay ${challenge.bgGradient} rounded-full`} />
              
              {/* Geometric Background SVG - Animates on hover */}
              {challenge.decorativeBg}
              
              <div className="relative z-10 flex flex-col items-center w-full flex-1">
                
                {/* 3D Pedestal for Icon */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8 flex-shrink-0">
                  <div className={`absolute inset-4 blur-xl rounded-full transition-colors duration-500 ${challenge.pedestalGlow}`} />
                  <div className={`absolute inset-0 bg-white/90 backdrop-blur-xl border border-white shadow-xl rounded-3xl flex items-center justify-center transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105 ${challenge.pedestalShadow}`}>
                    {challenge.icon}
                  </div>
                </div>
                
                <span className="text-primary font-bold tracking-widest uppercase text-[10px] mb-4 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                  {challenge.subtitle}
                </span>
                
                <h3 className="text-2xl xl:text-3xl font-black text-slate-800 transition-colors mb-6 leading-tight">
                  {challenge.title}
                </h3>
              </div>
              
              <div className="relative z-10 w-full pt-6 border-t border-slate-100 flex items-center justify-center gap-2 transition-colors mt-auto">
                {challenge.miniData}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
