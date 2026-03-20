import { Brain, Flame, Scale, Sparkles, TrendingUp } from "lucide-react";

const insights = [
  {
    icon: Brain,
    title: "La IA lidera las conversaciones hoy",
    body: "El 62% señala a la IA como el tema más activo de la red.",
    badge: "Más leído",
    accent: "from-indigo-500 via-fuchsia-500 to-cyan-400",
  },
  {
    icon: Flame,
    title: "Crece el rechazo a marcas globales",
    body: "El rechazo sube al 68%, el nivel más alto del mes.",
    badge: "En alza",
    accent: "from-orange-500 via-rose-500 to-red-500",
  },
  {
    icon: Scale,
    title: "Coca-Cola vs Pepsi sigue al rojo vivo",
    body: "La batalla se mantiene en 52/48 y concentra la mayor tensión.",
    badge: "Alta polarización",
    accent: "from-sky-500 via-indigo-500 to-fuchsia-500",
  },
  {
    icon: TrendingUp,
    title: "Las marcas locales siguen ganando terreno",
    body: "Consumo y preferencia muestran una inclinación sostenida por lo cercano.",
    badge: "Tendencia",
    accent: "from-emerald-500 via-teal-500 to-cyan-400",
  },
];

export function ResultsInsightWall() {
  return (
    <section className="w-full py-8 md:py-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-50 text-fuchsia-700 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
              <Sparkles className="w-4 h-4" />
              insight wall
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-950">
              Frases y datos de impacto
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Una lectura rápida de lo que la comunidad está revelando ahora.
            </p>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="min-w-[300px] md:min-w-[360px] snap-start rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className={`h-2 bg-gradient-to-r ${item.accent}`} />
                <div className="p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm">
                      {item.badge}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-lg ring-4 ring-slate-50`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950 leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
