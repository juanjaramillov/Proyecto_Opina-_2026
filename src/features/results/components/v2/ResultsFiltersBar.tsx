import { useState } from 'react';
import { ChevronDown, X, MapPin, Users, Calendar, GraduationCap, UserCircle2 } from 'lucide-react';
import {
  ResultsV2Filters,
  GenerationFilter,
  SexFilter,
  EducationFilter,
  AgeRange,
  GeoFilter,
} from '../../types/resultsV2';
import { REGIONES_CHILE, getComunasByRegion } from '../../data/regionesComunas';

/**
 * ResultsFiltersBar — barra de filtros B2C para /results-v2.
 *
 * 5 filtros independientes, cada uno como popover:
 *   - Generación · pills
 *   - Sexo · pills
 *   - Edad · range slider
 *   - Educación · pills
 *   - Geografía · región + comunas (jerárquico)
 *
 * Sticky · debajo del ViewSelector.
 *
 * Importante: hoy estos filtros son UI funcional, pero NO segmentan datos
 * reales del backend (no hay endpoint segmentado todavía). Cuando el backend
 * soporte segmentación, conectar `filters` al hook de datos.
 */

interface ResultsFiltersBarProps {
  filters: ResultsV2Filters;
  onChange: (patch: Partial<ResultsV2Filters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const GENERATION_OPTIONS: { id: GenerationFilter; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'GEN_Z', label: 'Gen Z' },
  { id: 'MILLENNIAL', label: 'Millennial' },
  { id: 'GEN_X', label: 'Gen X' },
  { id: 'BOOMER', label: 'Boomer' },
];

const SEX_OPTIONS: { id: SexFilter; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'FEMENINO', label: 'Femenino' },
  { id: 'MASCULINO', label: 'Masculino' },
  { id: 'OTRO', label: 'Otro' },
];

const EDU_OPTIONS: { id: EducationFilter; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'SECUNDARIA', label: 'Secundaria' },
  { id: 'UNIVERSITARIA', label: 'Universitaria' },
  { id: 'POSTGRADO', label: 'Postgrado' },
];

export function ResultsFiltersBar({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: ResultsFiltersBarProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((curr) => (curr === id ? null : id));
  const close = () => setOpenId(null);

  const genLabel = GENERATION_OPTIONS.find((o) => o.id === filters.generation)?.label ?? 'Todas';
  const sexLabel = SEX_OPTIONS.find((o) => o.id === filters.sex)?.label ?? 'Todos';
  const eduLabel = EDU_OPTIONS.find((o) => o.id === filters.education)?.label ?? 'Todas';
  const ageLabel =
    filters.age.min === 16 && filters.age.max === 80
      ? 'Toda edad'
      : `${filters.age.min}–${filters.age.max} años`;
  const geoLabel = (() => {
    if (filters.geo.region === 'ALL') return 'Todo el país';
    const reg = REGIONES_CHILE.find((r) => r.id === filters.geo.region);
    if (!reg) return 'Todo el país';
    if (filters.geo.comunas.length === 0) return reg.label;
    if (filters.geo.comunas.length === 1) {
      const c = reg.comunas.find((c) => c.id === filters.geo.comunas[0]);
      return c ? `${reg.label} · ${c.label}` : reg.label;
    }
    return `${reg.label} · ${filters.geo.comunas.length} comunas`;
  })();

  return (
    <div className="sticky top-[140px] z-30 w-full bg-white border-b border-stroke">
      <div className="container-ws">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0 mr-2">
            Filtros
          </span>

          <FilterChip
            id="gen"
            label={genLabel}
            icon={<UserCircle2 className="w-3.5 h-3.5" />}
            active={filters.generation !== 'ALL'}
            open={openId === 'gen'}
            onToggle={() => toggle('gen')}
            onClose={close}
          >
            <PillsGroup
              options={GENERATION_OPTIONS}
              value={filters.generation}
              onChange={(v) => {
                onChange({ generation: v as GenerationFilter });
                close();
              }}
            />
          </FilterChip>

          <FilterChip
            id="sex"
            label={sexLabel}
            icon={<Users className="w-3.5 h-3.5" />}
            active={filters.sex !== 'ALL'}
            open={openId === 'sex'}
            onToggle={() => toggle('sex')}
            onClose={close}
          >
            <PillsGroup
              options={SEX_OPTIONS}
              value={filters.sex}
              onChange={(v) => {
                onChange({ sex: v as SexFilter });
                close();
              }}
            />
          </FilterChip>

          <FilterChip
            id="age"
            label={ageLabel}
            icon={<Calendar className="w-3.5 h-3.5" />}
            active={filters.age.min !== 16 || filters.age.max !== 80}
            open={openId === 'age'}
            onToggle={() => toggle('age')}
            onClose={close}
          >
            <AgeRangePicker value={filters.age} onChange={(age) => onChange({ age })} />
          </FilterChip>

          <FilterChip
            id="edu"
            label={eduLabel}
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            active={filters.education !== 'ALL'}
            open={openId === 'edu'}
            onToggle={() => toggle('edu')}
            onClose={close}
          >
            <PillsGroup
              options={EDU_OPTIONS}
              value={filters.education}
              onChange={(v) => {
                onChange({ education: v as EducationFilter });
                close();
              }}
            />
          </FilterChip>

          <FilterChip
            id="geo"
            label={geoLabel}
            icon={<MapPin className="w-3.5 h-3.5" />}
            active={filters.geo.region !== 'ALL' || filters.geo.comunas.length > 0}
            open={openId === 'geo'}
            onToggle={() => toggle('geo')}
            onClose={close}
            wide
          >
            <GeoPicker geo={filters.geo} onChange={(geo) => onChange({ geo })} />
          </FilterChip>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-ink border border-transparent hover:border-stroke transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FilterChip · pill con popover
// ============================================================
function FilterChip({
  label,
  icon,
  active,
  open,
  onToggle,
  onClose,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap',
          active
            ? 'bg-brand-50 text-brand border-brand-200'
            : 'bg-white text-slate-700 border-stroke hover:border-brand/30',
        ].join(' ')}
      >
        {icon}
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* backdrop · click-outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* popover */}
          <div
            className={[
              'absolute top-full mt-2 left-0 z-50',
              wide ? 'w-[320px]' : 'w-[220px]',
              'bg-white rounded-2xl border border-stroke shadow-lift p-3',
            ].join(' ')}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// PillsGroup · grupo de pills mutuamente excluyentes
// ============================================================
function PillsGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
              active
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-slate-600 border-stroke hover:border-brand/30',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// AgeRangePicker · doble slider 16–80
// ============================================================
function AgeRangePicker({
  value,
  onChange,
}: {
  value: AgeRange;
  onChange: (v: AgeRange) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Edad</span>
        <span className="font-black text-brand">
          {value.min}–{value.max}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Desde</span>
          <input
            type="number"
            min={16}
            max={value.max}
            value={value.min}
            onChange={(e) =>
              onChange({ min: Math.max(16, Math.min(value.max, parseInt(e.target.value, 10) || 16)), max: value.max })
            }
            className="px-2 py-1.5 rounded-lg border border-stroke text-sm font-medium focus:outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hasta</span>
          <input
            type="number"
            min={value.min}
            max={80}
            value={value.max}
            onChange={(e) =>
              onChange({ min: value.min, max: Math.max(value.min, Math.min(80, parseInt(e.target.value, 10) || 80)) })
            }
            className="px-2 py-1.5 rounded-lg border border-stroke text-sm font-medium focus:outline-none focus:border-brand"
          />
        </label>
      </div>
    </div>
  );
}

// ============================================================
// GeoPicker · región + comunas (jerárquico)
// ============================================================
function GeoPicker({
  geo,
  onChange,
}: {
  geo: GeoFilter;
  onChange: (g: GeoFilter) => void;
}) {
  const comunas = geo.region !== 'ALL' ? getComunasByRegion(geo.region) : [];

  const toggleComuna = (comunaId: string) => {
    const has = geo.comunas.includes(comunaId);
    onChange({
      region: geo.region,
      comunas: has ? geo.comunas.filter((c) => c !== comunaId) : [...geo.comunas, comunaId],
    });
  };

  return (
    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Región</p>
        <select
          value={geo.region}
          onChange={(e) => onChange({ region: e.target.value, comunas: [] })}
          className="w-full px-3 py-1.5 rounded-lg border border-stroke text-sm font-medium focus:outline-none focus:border-brand"
        >
          <option value="ALL">Todo el país</option>
          {REGIONES_CHILE.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {comunas.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Comunas {geo.comunas.length > 0 ? `(${geo.comunas.length})` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {comunas.map((c) => {
              const active = geo.comunas.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleComuna(c.id)}
                  className={[
                    'px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors',
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-slate-600 border-stroke hover:border-brand/30',
                  ].join(' ')}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsFiltersBar;
