import { Brain, Flame, Newspaper, Zap } from "lucide-react";

const pulseItems = [
  {
    title: "La IA domina la conversación hoy",
    body: "El 62% señala a la IA como el tema más activo.",
    time: "Hace 2 horas",
    icon: Brain,
    accent: "from-indigo-500 via-fuchsia-500 to-cyan-400",
  },
  {
    title: "Sube el rechazo a marcas globales",
    body: "El rechazo alcanza 68%, el máximo del mes.",
    time: "Hace 1 hora",
    icon: Flame,
    accent: "from-orange-500 via-rose-500 to-red-500",
  },
  {
    title: "Versus Coca-Cola vs Pepsi al rojo vivo",
    body: "Pepsi aventaja por 52/48 esta semana.",
    time: "Hace 30 minutos",
    icon: Zap,
    accent: "from-sky-500 via-indigo-500 to-fuchsia-500",
  },
];

export function ResultsPulse() {
  return (
    <section className="w-full py-10 md:py-12">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
            <Newspaper className="w-4 h-4" />
            Qué está pasando ahora
          </span>
          <h3 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-slate-950">
            Pulso del momento
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pulseItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`rounded-[1.75rem] p-6 text-white shadow-lg bg-gradient-to-br ${item.accent} overflow-hidden relative`}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,white,transparent_40%)]" />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight leading-tight">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-white/90 leading-relaxed">{item.body}</p>
                  <p className="mt-5 text-sm font-semibold text-white/80">
                    {item.time}
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
