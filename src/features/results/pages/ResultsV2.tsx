import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Construction } from 'lucide-react';
import { analyticsService } from '../../analytics/services/analyticsService';
import { useResultsV2State } from '../hooks/useResultsV2State';
import ResultsViewSelector from '../components/v2/ResultsViewSelector';
import ResultsFiltersBar from '../components/v2/ResultsFiltersBar';
import ResultsHeroHybrid from '../components/v2/ResultsHeroHybrid';
import { ResultsV2View } from '../types/resultsV2';

/**
 * ResultsV2 — Nueva página /results-v2 (Sesión 1 · chasis).
 *
 * Estado actual (Sesión 1):
 *   - View Selector con 7 vistas funcional
 *   - FiltersBar con 5 filtros B2C funcional (estado en URL)
 *   - Hero Híbrido con anillos concéntricos (datos placeholder)
 *   - Cuerpo de cada vista: stub "en construcción"
 *
 * Próximas sesiones:
 *   2. Visualizaciones innovadoras V17 (DotTimeline, ConsensusMap, CrystalKPI, Sankey)
 *   3. Vistas individuales con KPIs reales
 *   4. Integración filtros + responsive
 *   5. Conectar useResultsExperience (datos reales)
 *
 * No reemplaza /results actual — convive en paralelo hasta validación humana.
 */

export default function ResultsV2() {
  const { view, filters, setView, setFilters, resetFilters, hasActiveFilters } = useResultsV2State();

  useEffect(() => {
    analyticsService.trackSystem('user_opened_results_v2', 'info');
  }, []);

  useEffect(() => {
    // Track cada cambio de vista para entender uso interno
    analyticsService.trackSystem('results_v2_view_change', 'info', { view });
  }, [view]);

  return (
    <div className="min-h-screen bg-white text-ink">
      <ResultsViewSelector active={view} onChange={setView} />

      <ResultsFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <ResultsHeroHybrid view={view} filters={filters} />

      <main
        id={`results-v2-panel-${view}`}
        role="tabpanel"
        aria-labelledby={`results-v2-tab-${view}`}
        className="w-full"
      >
        <ViewBody view={view} />
      </main>

      {/* Pie editorial · CTA hacia /signals */}
      <section className="w-full bg-surface2 border-t border-stroke py-16">
        <div className="container-ws">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-3">
              Cierre
            </p>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-ink leading-tight mb-4">
              Lo que veas acá lo construiste vos opinando.
            </h2>
            <p className="text-base font-medium text-slate-600 leading-relaxed mb-8">
              Cada Nodo de Señal Validada que aparece en estos resultados es la
              respuesta de alguien como vos. Cuanto más opines, más nítido se vuelve.
            </p>
            <Link
              to="/signals"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-bold tracking-tight text-white bg-gradient-to-r from-brand to-accent shadow-glow-brand transition-all hover:-translate-y-0.5 hover:shadow-glow-brand-lg"
            >
              Ir a opinar
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// ViewBody · stub por vista (Sesión 1)
// En sesiones siguientes cada caso renderiza componentes reales.
// ============================================================
function ViewBody({ view }: { view: ResultsV2View }) {
  return (
    <div className="container-ws py-16">
      <div className="rounded-3xl border-2 border-dashed border-stroke bg-surface2 p-12 text-center">
        <Construction className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Vista · {view}
        </p>
        <h3 className="text-2xl font-black font-display tracking-tight text-ink mb-3">
          En construcción
        </h3>
        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
          Esta vista está siendo armada en sesiones próximas. El chasis (header, vistas,
          filtros, hero) ya funciona. Acá se renderizarán las visualizaciones específicas
          de la vista seleccionada con datos del snapshot real.
        </p>
      </div>
    </div>
  );
}
