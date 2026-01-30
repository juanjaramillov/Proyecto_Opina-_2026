import { Link } from 'react-router-dom';
import { useSignalStore } from '../../../store/signalStore';
import { normalizeSignalEvents } from '../../../utils/normalizeSignalEvent';
import RequireEntitlement from '../../auth/components/RequireEntitlement';
import { useAccountProfile } from "../../../auth/useAccountProfile";

export default function MySignal() {
  const s = useSignalStore();
  const weight = (1.0 + (s.level - 1) * 0.1).toFixed(1);
  const { profile, loading } = useAccountProfile();

  if (loading || !profile) return null;

  return (
    <RequireEntitlement
      tier={profile.tier}
      profileCompleteness={profile.profileCompleteness}
      hasCI={profile.hasCI}
      require="history"
    >
      <div className="container-ws section-y">
        {/* ... Content ... */}
        <section className="card card-pad fade-up">
          {/* We just wrap the whole previous return roughly */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-ink">Mi señal</h1>
              <p className="text-text-secondary text-sm mt-1">
                Tu progreso y tu impacto dentro de Opina+.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge-primary">{s.levelTitle} · Nivel {s.level}</span>
              <span className="badge">🔥 {s.streakDays} racha</span>
              <span className="badge">📡 {s.signals} señales</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-text-secondary">Progreso al siguiente nivel</span>
              <span className="grad-text">{s.progressPct}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-surface2 overflow-hidden">
              <div className="h-3 bg-primary transition-all duration-700" style={{ width: `${s.progressPct}%` }} />
            </div>
            <div className="mt-2 text-xs text-text-muted">
              Próximo nivel en <b>{s.nextLevelAt}</b> señales · Peso actual: <b>{weight}x</b>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <Link to="/profile" className="btn-secondary w-full sm:w-auto">Ver perfil</Link>
            <Link to="/versus" className="btn-primary w-full sm:w-auto">Ir a votar</Link>
          </div>
        </section>

        <section className="card card-pad fade-up mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">Actividad reciente</h2>
            <span className="badge">últimos 50</span>
          </div>

          {(!s.signalEvents || s.signalEvents.length === 0) ? (
            <div className="mt-4 rounded-2xl border border-stroke bg-surface2 p-6 text-sm text-text-secondary">
              Aún no tienes eventos registrados. Vota en Versus para generar historial.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-stroke">
              <div className="grid grid-cols-12 bg-surface2 px-4 py-2 text-xs font-semibold text-text-secondary">
                <div className="col-span-4">Fecha</div>
                <div className="col-span-5">Evento</div>
                <div className="col-span-3 text-right">Puntos</div>
              </div>

              {normalizeSignalEvents(s.signalEvents).map((e) => (
                <div key={e.id} className="grid grid-cols-12 px-4 py-2 text-sm border-t border-stroke">
                  <div className="col-span-4 text-text-muted">
                    {new Date(e.createdAt).toLocaleString()}
                  </div>

                  <div className="col-span-5">
                    <div className="font-semibold text-ink">
                      {e.title || e.kind || 'señal'}
                    </div>
                    {(e.choiceLabel || e.kind) && (
                      <div className="text-xs text-text-muted">
                        {e.kind ? e.kind : e.sourceType}{e.choiceLabel ? ` · ${e.choiceLabel}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="col-span-3 text-right font-semibold text-ink">
                    +{e.amount ?? 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </RequireEntitlement>
  );
}
