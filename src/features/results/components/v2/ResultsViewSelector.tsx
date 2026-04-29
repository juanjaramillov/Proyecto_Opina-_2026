import { Layers, TrendingUp, Swords, Trophy, Target, Newspaper, MapPin } from 'lucide-react';
import { ResultsV2View } from '../../types/resultsV2';

/**
 * ResultsViewSelector — barra horizontal deslizable de vistas.
 *
 * Comportamiento:
 *   - Sticky debajo del header de PageShell.
 *   - En desktop: 7 pills horizontales con iconos lucide-react.
 *   - En mobile: scroll horizontal natural (overflow-x-auto + snap).
 *   - Vista activa con border accent + halo sutil V17.
 */

interface ResultsViewSelectorProps {
  active: ResultsV2View;
  onChange: (view: ResultsV2View) => void;
}

interface ViewDef {
  id: ResultsV2View;
  label: string;
  icon: typeof Layers;
}

const VIEWS: ViewDef[] = [
  { id: 'resumen', label: 'Resumen', icon: Layers },
  { id: 'tendencias', label: 'Tendencias', icon: TrendingUp },
  { id: 'versus', label: 'Versus', icon: Swords },
  { id: 'torneos', label: 'Torneos', icon: Trophy },
  { id: 'profundidad', label: 'Profundidad', icon: Target },
  { id: 'noticias', label: 'Noticias', icon: Newspaper },
  { id: 'mapa', label: 'Mapa', icon: MapPin },
];

export function ResultsViewSelector({ active, onChange }: ResultsViewSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Vista de Resultados"
      className="sticky top-[80px] z-40 w-full bg-white/90 backdrop-blur-md border-b border-stroke"
    >
      <div className="container-ws">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-3">
          {VIEWS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`results-v2-panel-${id}`}
                onClick={() => onChange(id)}
                className={[
                  'snap-start shrink-0 inline-flex items-center gap-2',
                  'px-4 py-2 rounded-full text-sm font-bold tracking-tight',
                  'border transition-all duration-200',
                  isActive
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-white text-slate-600 border-stroke hover:border-brand hover:text-ink',
                ].join(' ')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ResultsViewSelector;
