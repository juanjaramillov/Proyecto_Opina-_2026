import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual(_props: ResultsHeroFactualProps) {
  return (
    <section className="w-full bg-slate-50 pt-24 pb-10 md:pt-32 md:pb-14 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Estado de la comunidad
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 md:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1.5 mb-5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  insight principal
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[0.95]">
                La comunidad está dividida frente a la IA
              </h1>

              <p className="mt-5 text-lg md:text-xl text-slate-600 leading-snug max-w-3xl">
                Empate técnico entre entusiasmo tecnológico y preocupación por
                regulación, privacidad y control.
              </p>

              <div className="mt-8 rounded-[1.75rem] overflow-hidden bg-[radial-gradient(circle_at_15%_60%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_70%_35%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_85%_75%,rgba(244,63,94,0.16),transparent_26%),linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] h-[240px] md:h-[280px] relative">
                <div className="absolute inset-x-0 bottom-10 h-px bg-slate-200" />
                <div className="absolute inset-x-0 bottom-10 flex justify-between px-6 text-[11px] md:text-xs font-semibold text-slate-400">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                </div>

                <svg
                  viewBox="0 0 520 260"
                  className="absolute inset-0 w-full h-full"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="heroLineA" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="heroLineB" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="50%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M10 180 C60 150, 95 120, 150 138 C215 160, 230 84, 285 110 C340 136, 360 210, 430 120 C455 88, 475 108, 510 86"
                    stroke="url(#heroLineA)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 155 C55 130, 95 170, 150 160 C205 150, 235 135, 285 175 C335 215, 380 138, 430 154 C470 167, 490 145, 510 152"
                    stroke="url(#heroLineB)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  <circle cx="430" cy="120" r="6" fill="#22d3ee" />
                  <circle cx="430" cy="154" r="6" fill="#f472b6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-7 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    consenso
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-400">01</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 leading-tight">
                78% apoya regulación tecnológica
              </h2>

              <p className="mt-3 text-sm md:text-base text-slate-500 leading-snug">
                Alto nivel de acuerdo frente a reglas más claras para IA y uso
                de datos.
              </p>

              <div className="mt-7 flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(#22c55e_0deg,_#34d399_280deg,_#e2e8f0_280deg,_#e2e8f0_360deg)]" />
                  <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-black text-emerald-600">
                      78%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-4xl font-black tracking-tight text-slate-950">
                    78%
                  </div>
                  <div className="text-sm font-semibold text-slate-500">
                    Acuerdo en la comunidad
                  </div>
                  <div className="mt-4 h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-rose-200 shadow-sm p-7 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 text-rose-700 px-3 py-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    tu posición
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-400">02</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 leading-tight">
                Estás fuera del consenso en tecnología
              </h2>

              <p className="mt-3 text-sm md:text-base text-slate-500 leading-snug">
                Tus últimas señales te dejan fuera de la corriente dominante.
              </p>

              <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-rose-700">
                    Diferencia vs comunidad
                  </span>
                  <span className="text-3xl font-black tracking-tight text-rose-600">
                    9%
                  </span>
                </div>

                <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full w-[9%] rounded-full bg-gradient-to-r from-rose-500 to-orange-400" />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Tu postura difiere del{" "}
                  <strong className="text-slate-900">91%</strong> de la
                  comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
