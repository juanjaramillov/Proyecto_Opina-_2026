
import { Trophy, Flame, Search, BarChart2, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChallengesMenuSection() {
  const challenges = [
    {
      title: "La final de marcas",
      subtitle: "Torneos",
      icon: <Trophy className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-amber-500 drop-shadow-[0_15px_15px_rgba(251,191,36,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />,
      bgImage: "bg-gradient-to-br from-amber-500/5 to-transparent",
      borderColor: "group-hover:border-amber-500/30",
      link: "/torneos",
      miniData: <><span className="text-primary font-bold">5.2K Señales</span> hoy</>,
      miniIcon: <BarChart2 className="w-4 h-4 text-amber-500" />
    },
    {
      title: "El debate de la semana",
      subtitle: "Actualidad",
      icon: <Flame className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-rose-500 drop-shadow-[0_15px_15px_rgba(244,63,94,0.5)] transform scale-105 group-hover:scale-110 transition-transform duration-500 delay-75" />,
      bgImage: "bg-gradient-to-br from-rose-500/5 to-transparent",
      borderColor: "group-hover:border-rose-500/30",
      link: "/versus",
      miniData: "Creciendo un 45%",
      miniIcon: <TrendingUp className="w-4 h-4 text-rose-500" />
    },
    {
      title: "Desbloquea tu lectura",
      subtitle: "Profundidad",
      icon: <Search className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-indigo-500 drop-shadow-[0_15px_15px_rgba(99,102,241,0.5)] transform rotate-6 group-hover:rotate-0 transition-transform duration-500 delay-150" />,
      bgImage: "bg-gradient-to-br from-indigo-500/5 to-transparent",
      borderColor: "group-hover:border-indigo-500/30",
      link: "/resultados",
      miniData: "72% para descubrir",
      miniIcon: <Lock className="w-4 h-4 text-indigo-500" />
    }
  ];

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-ink mb-10 text-center md:text-left">
          Aumenta tu impacto. <span className="text-gradient-brand">Suma tus señales a estos versus.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((challenge, idx) => (
            <Link 
              key={idx} 
              to={challenge.link}
              className={`group relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8 pb-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-50/50 flex flex-col items-center text-center justify-between ${challenge.borderColor}`}
            >
              <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${challenge.bgImage}`} />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                {challenge.icon}
                
                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 bg-primary/10 px-3 py-1 rounded-full">
                  {challenge.subtitle}
                </span>
                
                <h3 className="text-2xl font-black text-slate-800 transition-colors mb-6 leading-tight">
                  {challenge.title}
                </h3>
              </div>
              
              <div className="relative z-10 w-full pt-6 border-t border-slate-100 flex items-center justify-center gap-2 group-hover:border-slate-200 transition-colors">
                {challenge.miniIcon}
                <span className="text-slate-500 font-semibold text-sm">
                  {challenge.miniData}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
