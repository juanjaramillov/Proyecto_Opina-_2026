import { EmptyState } from '../../../components/ui/EmptyState';
import { ParticipationSummary, ActivityEvent } from '../services/profileService';

interface ProfileActivitySummaryProps {
  participation: ParticipationSummary;
  history: ActivityEvent[];
}

export function ProfileActivitySummary({ participation, history }: ProfileActivitySummaryProps) {
  return (
    <>
      <section className="card p-6 shadow-sm">
        <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">analytics</span>
          Actividad
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Versus respondidos</span>
            <span className="font-mono font-black text-ink">{participation.versus_count}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Preguntas perfil</span>
            <span className="font-mono font-black text-ink">{participation.progressive_count}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Análisis profundo</span>
            <span className="font-mono font-black text-ink">{participation.depth_count}</span>
          </div>
        </div>
      </section>

      <section className="card p-6 shadow-sm">
        <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">history</span>
          Reciente
        </h3>
        <div className="space-y-4">
          {history.length === 0 ? (
            <EmptyState
              title="Sin señales previas"
              description="No reportas actividad reciente."
              icon="history_toggle_off"
            />
          ) : history.map((event) => (
            <div key={event.id} className="flex gap-4 items-start border-l-2 border-primary/30 pl-3 py-1">
              <div className="flex-1">
                <p className="text-sm font-bold text-ink leading-tight">
                  {event.module_type === 'versus' ? 'Participaste en Versus' :
                    event.module_type === 'progressive' ? 'Actualizaste perfil' :
                      event.module_type === 'depth' ? 'Análisis de marca' : 'Actividad'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-text-muted mt-1 font-bold">
                  {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default ProfileActivitySummary;
