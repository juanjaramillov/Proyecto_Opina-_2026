import { Coins, Eye, ShieldCheck, Sparkles } from "lucide-react";

export default function RewardsValuePropsSection() {
  const rewards = [
    {
      icon: <Coins className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform duration-500" />,
      title: "Acumula señales",
      description: "Cada aporte fortalece tu perfil interactivo y suma valor real a la red de inteligencia colectiva.",
      glowColor: "bg-amber-500/20",
      borderColor: "group-hover:border-amber-500/50"
    },
    {
      icon: <Eye className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />,
      title: "Accede a radiografías",
      description: "Cruza la barrera de participación para ver macro-tendencias e insights avanzados ocultos para el resto.",
      glowColor: "bg-emerald-500/20",
      borderColor: "group-hover:border-emerald-500/50"
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />,
      title: "Escala tu influencia",
      description: "Mientras más aportas, más subes de nivel y te conviertes en un referente dentro del mapa relacional.",
      glowColor: "bg-primary/20",
      borderColor: "group-hover:border-primary/50"
    }
  ];

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Gradient Blending Transition From Previous White Section */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none z-0" />

      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 font-bold text-sm mb-6 uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Valor B2C</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Tus señales <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">tienen valor.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium">
            En Opina+ no solo dejas tu huella. Construyes tu reputación y desbloqueas datos e insights por ayudar a mapear la inteligencia colectiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {rewards.map((reward, idx) => (
            <div 
              key={idx}
              className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 overflow-hidden ${reward.borderColor}`}
            >
              {/* Internal Glow Effect on Hover */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${reward.glowColor}`} />
              
              <div className="relative z-10">
                <div className="mb-6">
                  {reward.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{reward.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {reward.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
