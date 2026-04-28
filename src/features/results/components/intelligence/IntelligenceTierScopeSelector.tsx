import { useState, useMemo } from 'react';
import { GradientCTA, GradientText } from '../../../../components/ui/foundation';
import { TIERS, SCOPES, ScopeType } from './tierScopeMatrix';
import { KPITier, countKPIsInTier } from './kpiCatalog';

interface Props {
  /** Callback al hacer click en CTA — típicamente scroll al lead form con prefill */
  onRequestQuote: (selection: { tier: KPITier; scope: ScopeType }) => void;
}

/**
 * Selector visual Tier × Scope.
 * Muestra qué incluye cada combinación. Sin precios públicos en MVP.
 */
export function IntelligenceTierScopeSelector({ onRequestQuote }: Props) {
  const [selectedTier, setSelectedTier]   = useState<KPITier>('pro');
  const [selectedScope, setSelectedScope] = useState<ScopeType>('category');

  const tier  = useMemo(() => TIERS.find(t => t.id === selectedTier)!,   [selectedTier]);
  const scope = useMemo(() => SCOPES.find(s => s.id === selectedScope)!, [selectedScope]);
  const kpiCount = useMemo(() => countKPIsInTier(selectedTier),          [selectedTier]);

  return (
    <section className="card p-8 md:p-12 border-none shadow-lg bg-gradient-to-br from-white to-surface2/30">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-brand font-bold uppercase tracking-widest text-xs mb-3 block">
          Configurá tu acceso
        </span>
        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-4">
          Combiná <GradientText>tier × alcance</GradientText>
        </h2>
        <p className="text-slate-600 font-medium text-lg">
          Pagás solo por la profundidad que necesitás y las marcas que te importan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* COLUMNA 1: SELECTOR TIER */}
        <div className="card p-6 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            1. Profundidad analítica
          </div>
          <div className="space-y-2">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedTier === t.id
                    ? 'border-brand bg-brand/5'
                    : 'border-stroke bg-white hover:border-brand/30'
                }`}
                aria-pressed={selectedTier === t.id}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-ink">{t.displayName}</span>
                  {selectedTier === t.id && (
                    <span className="material-symbols-outlined text-brand text-[18px]">check_circle</span>
                  )}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.subtitle}</div>
                <div className="text-xs text-slate-600 font-medium mt-2 leading-snug">{t.pitch}</div>
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: SELECTOR SCOPE */}
        <div className="card p-6 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            2. Alcance
          </div>
          <div className="space-y-2">
            {SCOPES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedScope(s.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedScope === s.id
                    ? 'border-brand bg-brand/5'
                    : 'border-stroke bg-white hover:border-brand/30'
                }`}
                aria-pressed={selectedScope === s.id}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-ink">{s.displayName}</span>
                  {selectedScope === s.id && (
                    <span className="material-symbols-outlined text-brand text-[18px]">check_circle</span>
                  )}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1 leading-snug">{s.description}</div>
                <div className="text-[10px] text-slate-400 italic mt-2 font-medium">Ej: {s.example}</div>
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: RESUMEN + CTA */}
        <div className="card p-6 border-2 border-brand bg-white shadow-xl flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3">
            Tu configuración
          </div>

          <div className="mb-4">
            <div className="text-2xl font-black text-ink leading-tight">{tier.displayName}</div>
            <div className="text-sm text-slate-600 font-medium">{scope.displayName}</div>
          </div>

          <div className="space-y-3 mb-6 flex-1">
            <Row label="KPIs incluidos" value={`${kpiCount} métricas`} />
            <Row label="Frescura" value={tier.freshness} />
            <Row label="Histórico" value={tier.historyWindow} />
            <Row label="Formatos" value={tier.formats.join(', ')} />
            <Row label="Volumen" value={tier.rateLimit} />
            <Row label="SLA" value={tier.sla} />
          </div>

          <div className="bg-surface2 rounded-xl p-4 mb-4 border border-stroke">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Precio</div>
            <div className="text-base font-black text-ink leading-tight">Cotización personalizada</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Respuesta en menos de 24h hábiles</div>
          </div>

          <GradientCTA
            label="Solicitar cotización"
            icon="arrow_forward"
            iconPosition="trailing"
            size="md"
            fullWidth
            onClick={() => onRequestQuote({ tier: selectedTier, scope: selectedScope })}
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic mt-8 text-center font-medium max-w-2xl mx-auto">
        Plan Enterprise + scope All access disponibles bajo conversación con ventas.
        Acceso programático vía API en preparación (Q3 2026).
      </p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-ink font-bold text-right">{value}</span>
    </div>
  );
}
