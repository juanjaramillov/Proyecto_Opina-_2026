import { TrendingUp, Flame, Users } from "lucide-react";
import { GradientText } from "../../../components/ui/foundation";

// @architecture-note: pending-backend
// Data de demostración. Reemplazar con llamada real a la API de tendencias cuando esté disponible.
// Estructura esperada del backend: ver types/signals.ts (a definir cuando se implemente el endpoint).
const TRENDING_SIGNALS = [
  {
    id: 1,
    category: "#Streaming",
    question: "Netflix vs Max: ¿Qué suscripción vale realmente la pena mantener en 2026?",
    consensus: 68,
    leadingOption: "Max (HBO)",
    delta: "+12%",
    participants: "124.5k",
    avatars: [11, 5, 8],
  },
  {
    id: 2,
    category: "#Marcas",
    question: "¿Nike perdió su factor 'cool' frente a nuevas marcas como On Running o Hoka?",
    consensus: 54,
    leadingOption: "Sí, se estancó",
    delta: "+8%",
    participants: "89.2k",
    avatars: [12, 33, 47],
  },
  {
    id: 3,
    category: "#Gaming",
    question: "GTA VI: ¿Crees que logrará cumplir las expectativas astronómicas de la comunidad?",
    consensus: 85,
    leadingOption: "Romperá récords",
    delta: "+5%",
    participants: "210.1k",
    avatars: [22, 15, 9],
  },
];

const TICKER_TOPICS = [
  "Banca digital",
  "Movilidad eléctrica",
  "Salud mental",
  "Educación online",
  "Streaming premium",
  "Food delivery",
  "Retail omnicanal",
  "Fintech",
  "Sostenibilidad",
  "Turismo premium",
  "Gaming móvil",
  "Cripto regulada",
];

export default function LiveTrendsSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden border-t border-stroke">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            En Vivo Ahora
          </div>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-ink mb-6 tracking-tight">
            Lo que <GradientText>mueve</GradientText> la red
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Estas son las señales con más tracción en este momento. Cada minuto, miles de opiniones reescriben el consenso.
          </p>
        </div>

        {/* Grid de 3 tarjetas glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {TRENDING_SIGNALS.map((signal, idx) => (
            <div key={signal.id} className="relative group">
              {/* Glow detrás de la card, alterna brand/accent */}
              <div
                className={`absolute -inset-1 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 ${
                  idx % 2 === 0 ? "bg-brand/20" : "bg-accent/20"
                }`}
              />

              <div className="relative bg-gradient-to-b from-white to-slate-50 border-t-2 border-white shadow-[0_15px_35px_rgba(0,0,0,0.05),_inset_0_2px_4px_rgba(255,255,255,1)] rounded-[2rem] p-6 flex flex-col gap-5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] transition-all duration-500 h-full">
                {/* Header: categoría + delta */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    <Flame className="w-3 h-3 text-brand" />
                    {signal.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-accent">
                    <TrendingUp className="w-3 h-3" />
                    {signal.delta} hoy
                  </span>
                </div>

                {/* Pregunta */}
                <h3 className="text-base sm:text-lg font-black font-display text-ink leading-snug">
                  {signal.question}
                </h3>

                {/* Consenso */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Consenso</span>
                      <span className="text-sm font-bold text-slate-700">{signal.leadingOption}</span>
                    </div>
                    <span className="text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent leading-none">
                      {signal.consensus}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-br from-brand to-accent rounded-full transition-all duration-1000"
                      style={{ width: `${signal.consensus}%` }}
                    />
                  </div>
                </div>

                {/* Footer: participantes */}
                <div className="flex items-center justify-between pt-3 border-t border-stroke mt-auto">
                  <div className="flex -space-x-2">
                    {signal.avatars.map((avatarId, i) => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/100?img=${avatarId}`}
                        alt=""
                        className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                    ))}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-accent border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-black text-white">
                      +
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    {signal.participants}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ticker marquee — tópicos trending */}
        <div
          className="relative w-full overflow-hidden py-4 border-y border-stroke"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex gap-3 animate-marquee whitespace-nowrap">
            {[...TICKER_TOPICS, ...TICKER_TOPICS].map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm shrink-0"
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${i % 2 === 0 ? "bg-brand" : "bg-accent"}`} />
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
