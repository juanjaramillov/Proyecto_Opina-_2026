import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { LockKeyhole, Sparkles } from "lucide-react";

interface ResultsProgressionProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsProgression({
  snapshot,
}: ResultsProgressionProps) {
  const totalSignals = snapshot.overview.totalSignals || 142;
  const nextGoal = 500;
  const remaining = Math.max(nextGoal - totalSignals, 0);
  const progress = Math.min((totalSignals / nextGoal) * 100, 100);

  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-700 text-white shadow-2xl">
          <div className="p-8 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]">
                <Sparkles className="w-4 h-4" />
                siguiente desbloqueo
              </span>

              <h3 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ahora puedes ver cómo piensa tu comuna
              </h3>

              <p className="mt-4 text-white/85 text-lg max-w-2xl">
                Explora opiniones segmentadas por edad y descubre cómo se mueve
                la conversación donde tú vives.
              </p>

              <div className="mt-8">
                <div className="flex items-center justify-between text-sm font-semibold text-white/80 mb-3">
                  <span>Tu progreso actual</span>
                  <span>
                    {totalSignals} / {nextGoal}
                  </span>
                </div>
                <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-white/80">
                  Te faltan <strong>{remaining}</strong> señales para llegar al
                  siguiente nivel.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-[1.75rem] bg-white/10 backdrop-blur-md p-6 border border-white/15">
                <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center mb-5">
                  <LockKeyhole className="w-8 h-8" />
                </div>

                <h4 className="text-2xl font-black tracking-tight">
                  Desbloqueo activo
                </h4>
                <p className="mt-2 text-white/80 leading-relaxed">
                  Acceso a comparaciones por comuna, edad y perfiles similares.
                </p>

                <button className="mt-6 w-full rounded-2xl bg-white text-indigo-700 font-black py-3.5 px-5 shadow-lg hover:bg-indigo-50 transition-colors">
                  Generar impacto ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
