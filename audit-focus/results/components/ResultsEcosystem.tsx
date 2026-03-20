import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { Activity, Trophy, Vote, Waves } from "lucide-react";

const modules = [
  {
    title: "Pepsi gana leve ventaja sobre Coca-Cola",
    detail: "52% Pepsi esta semana",
    time: "Hace 1 día",
    icon: Activity,
    accent: "from-sky-500 via-indigo-500 to-fuchsia-500",
  },
  {
    title: "Nike domina torneo deportivo",
    detail: "36% del volumen total",
    time: "Hace 3 horas",
    icon: Trophy,
    accent: "from-emerald-500 via-teal-500 to-cyan-400",
  },
  {
    title: "La IA concentra la mayor participación",
    detail: "Tema más respondido",
    time: "Hace 45 minutos",
    icon: Vote,
    accent: "from-orange-500 via-rose-500 to-red-500",
  },
  {
    title: "“Celular” domina frente a “Sobrio”",
    detail: "Profundidad",
    time: "Hace 2 horas",
    icon: Waves,
    accent: "from-violet-500 via-fuchsia-500 to-pink-500",
  },
];

interface ResultsEcosystemProps {
  snapshot?: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot: _snapshot }: ResultsEcosystemProps) {
  return (
    <section className="w-full py-10 md:py-12">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-violet-700 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
            Actividad de la comunidad
          </span>
          <h3 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-slate-950">
            Ecosistema de opinión
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <article className="lg:col-span-8 rounded-[2rem] overflow-hidden shadow-lg bg-gradient-to-br from-indigo-900 via-violet-800 to-fuchsia-700 text-white p-6 md:p-8 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,white,transparent_35%)]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
                  Versus destacado
                </span>
                <h4 className="mt-4 text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Pepsi gana leve ventaja sobre Coca-Cola
                </h4>
                <p className="mt-3 text-white/85 text-lg">
                  El duelo más seguido de la semana se mantiene vivo en 52/48.
                </p>
                <p className="mt-5 text-sm font-semibold text-white/80">
                  Hace 1 día
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[240px]">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                  <div className="text-sm font-semibold text-white/70">Pepsi</div>
                  <div className="text-4xl font-black mt-1">52%</div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                  <div className="text-sm font-semibold text-white/70">Coca-Cola</div>
                  <div className="text-4xl font-black mt-1">48%</div>
                </div>
              </div>
            </div>
          </article>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {modules.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h5 className="mt-4 text-xl font-black tracking-tight text-slate-950 leading-tight">
                    {item.title}
                  </h5>
                  <p className="mt-2 text-slate-600">{item.detail}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    {item.time}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
