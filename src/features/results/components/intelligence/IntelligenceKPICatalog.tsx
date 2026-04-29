import { useState } from 'react';
import { GradientText } from '../../../../components/ui/foundation';
import { KPI_CATALOG, KPILayer, KPITier, kpisInLayerForTier } from './kpiCatalog';

const TIERS: { id: KPITier; label: string; cssAccent: string }[] = [
  { id: 'basic',      label: 'Basic',      cssAccent: 'text-slate-600' },
  { id: 'pro',        label: 'Pro',        cssAccent: 'text-brand' },
  { id: 'enterprise', label: 'Enterprise', cssAccent: 'text-accent' },
];

/**
 * Tabla expandible que muestra qué KPIs trae cada tier por capa.
 * Click en una capa → expande la lista detallada de KPIs.
 */
export function IntelligenceKPICatalog() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="card p-8 md:p-12 border-none shadow-lg">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-brand font-bold uppercase tracking-widest text-xs mb-3 block">
          Catálogo de KPIs por tier
        </span>
        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-4">
          Qué incluye <GradientText>cada plan</GradientText>
        </h2>
        <p className="text-slate-600 font-medium text-lg">
          Hacé click en cada capa para ver los KPIs específicos. Total de métricas vendibles según tier.
        </p>
      </div>

      {/* HEADER de tiers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface2 border border-stroke rounded-t-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div className="col-span-6 md:col-span-7">Capa</div>
        {TIERS.map(t => (
          <div key={t.id} className={`col-span-2 md:col-span-1 lg:col-span-1 text-center ${t.cssAccent}`}>{t.label}</div>
        ))}
        <div className="col-span-0 md:col-span-2 hidden md:block text-right pr-2">KPIs</div>
      </div>

      {/* FILAS de capas */}
      <div className="border border-t-0 border-stroke rounded-b-2xl overflow-hidden divide-y divide-stroke">
        {KPI_CATALOG.map(layer => (
          <LayerRow
            key={layer.code}
            layer={layer}
            isExpanded={expanded === layer.code}
            onToggle={() => setExpanded(expanded === layer.code ? null : layer.code)}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-500 italic mt-6 text-center font-medium">
        Las capas de salud de producto, integridad cruda y gamificación no se exponen al producto comercial.
        Catálogo filtrado contra <span className="font-bold text-slate-700">commercial_status = sellable</span>.
      </p>
    </section>
  );
}

interface LayerRowProps {
  layer: KPILayer;
  isExpanded: boolean;
  onToggle: () => void;
}

function LayerRow({ layer, isExpanded, onToggle }: LayerRowProps) {
  const counts = {
    basic:      kpisInLayerForTier(layer, 'basic').length,
    pro:        kpisInLayerForTier(layer, 'pro').length,
    enterprise: kpisInLayerForTier(layer, 'enterprise').length,
  };

  return (
    <div className="bg-white">
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-12 gap-2 px-4 py-4 hover:bg-surface2/50 transition-colors text-left items-center"
        aria-expanded={isExpanded}
      >
        <div className="col-span-6 md:col-span-7">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
            <div>
              <div className="text-sm font-black text-ink leading-tight">{layer.name}</div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 hidden md:block">{layer.description}</div>
            </div>
          </div>
        </div>
        <CountCell count={counts.basic}      tier="basic" />
        <CountCell count={counts.pro}        tier="pro" />
        <CountCell count={counts.enterprise} tier="enterprise" />
        <div className="col-span-0 md:col-span-2 hidden md:block text-right pr-2 text-[11px] font-bold text-slate-400">
          {layer.kpis.length} totales
        </div>
      </button>

      {isExpanded && (
        <div className="bg-surface2/30 px-6 py-4 border-t border-stroke">
          <ul className="space-y-2">
            {layer.kpis.map(kpi => (
              <li key={kpi.name} className="flex items-start gap-3 text-sm">
                <TierBadge tier={kpi.minTier} />
                <div className="flex-1">
                  <span className="font-bold text-ink">{kpi.name}</span>
                  <span className="text-slate-500 font-medium"> — {kpi.description}</span>
                  {kpi.hasHistory && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <span className="material-symbols-outlined text-[12px]">timeline</span>
                      historia
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CountCell({ count, tier }: { count: number; tier: KPITier }) {
  const isEmpty = count === 0;
  const colorMap: Record<KPITier, string> = {
    basic:      'text-slate-700 bg-slate-100',
    pro:        'text-brand bg-brand/10',
    enterprise: 'text-accent bg-accent/10',
  };
  return (
    <div className="col-span-2 md:col-span-1 text-center">
      {isEmpty ? (
        <span className="text-stroke text-lg">—</span>
      ) : (
        <span className={`inline-flex items-center justify-center min-w-[32px] h-7 rounded-full text-xs font-black ${colorMap[tier]}`}>
          {count}
        </span>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: KPITier }) {
  const map: Record<KPITier, { label: string; cls: string }> = {
    basic:      { label: 'Basic',      cls: 'bg-slate-100 text-slate-700' },
    pro:        { label: 'Pro',        cls: 'bg-brand/10 text-brand' },
    enterprise: { label: 'Enterprise', cls: 'bg-accent/10 text-accent' },
  };
  const { label, cls } = map[tier];
  return (
    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 ${cls}`}>
      {label}
    </span>
  );
}
