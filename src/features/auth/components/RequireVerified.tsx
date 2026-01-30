import React from 'react';
import { Link } from 'react-router-dom';

import { useVerificationStatus } from '../../../hooks/useVerificationStatus';

type Props = { children: React.ReactNode };

const RequireVerified: React.FC<Props> = ({ children }) => {
  const { isVerified } = useVerificationStatus();

  // Demo Mode:
  // - Si NO existe VITE_DEMO_MODE, queda abierto (demo friendly)
  // - Solo se bloquea cuando VITE_DEMO_MODE === 'false'
  const isDemo = import.meta.env.VITE_DEMO_MODE !== 'false';

  // En demo: todo pasa
  if (isDemo) return <>{children}</>;

  // En modo real: solo verificados
  if (isVerified) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <main className="py-10 pb-16">
        <div className="max-w-ws mx-auto px-5">
          <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="m-0 text-2xl tracking-tight text-ink">Sección bloqueada</h1>
                <p className="mt-2 text-[13px] leading-relaxed max-w-[80ch] text-muted">
                  Para opinar necesitamos identidad verificada (RUT). Esto reduce bots y hace que las reviews sean confiables.
                </p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <Link
                  to="/verificacion"
                  className="border border-primary/35 bg-gradient-to-b from-primary/20 to-primary/10 shadow-home text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                >
                  Verificar RUT
                </Link>

                <Link
                  to="/results"
                  className="border border-white/14 bg-white/5 text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                >
                  Ver resultados
                </Link>
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                <div className="font-black text-sm tracking-tight text-ink">1 cuenta = 1 RUT</div>
                <div className="mt-1.5 text-muted text-xs leading-relaxed">Evita duplicados y fraude.</div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                <div className="font-black text-sm tracking-tight text-ink">Respuestas rápidas</div>
                <div className="mt-1.5 text-muted text-xs leading-relaxed">Preguntas con alternativas, sin texto largo.</div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                <div className="font-black text-sm tracking-tight text-ink">Mejor data</div>
                <div className="mt-1.5 text-muted text-xs leading-relaxed">Permite rankings reales por comuna/segmento.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequireVerified;
