import { useMemo } from 'react';

/**
 * TimeFilterPresets — selector temporal simplificado para usuarios B2C.
 *
 * Presenta 6 botones fijos que permiten al usuario viajar en el tiempo
 * en un ranking sin tener que manipular un date picker complejo.
 *
 * Producto (Bloque B, decisión 2026-04-24):
 *   - Todos los presets representan "foto acumulada a esa fecha",
 *     NO una ventana de tiempo.
 *   - Tope máximo: 1 año atrás (consistente con política B2C).
 *
 * Para usuarios B2B/Admin, usar TimeFilterRangePicker en su lugar
 * (pendiente de implementar — permite rango custom con dos fechas).
 */

export type TimeFilterPreset = 'today' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface TimeFilterPresetsProps {
    /**
     * Preset actualmente seleccionado. 'today' es el default.
     */
    value: TimeFilterPreset;
    /**
     * Callback cuando el usuario cambia de preset.
     * Recibe el nuevo preset y la fecha calculada en UTC.
     *   - 'today'  → undefined (el consumidor interpreta como "now()")
     *   - cualquier otro → Date con el corte correspondiente
     */
    onChange: (preset: TimeFilterPreset, asOf: Date | undefined) => void;
    /**
     * Clase CSS opcional para estilos custom del contenedor.
     */
    className?: string;
}

const PRESETS: Array<{ key: TimeFilterPreset; label: string; daysBack: number }> = [
    { key: 'today', label: 'Hoy',            daysBack: 0 },
    { key: '1w',    label: 'Semana pasada',  daysBack: 7 },
    { key: '1m',    label: 'Mes pasado',     daysBack: 30 },
    { key: '3m',    label: '3 meses',        daysBack: 90 },
    { key: '6m',    label: '6 meses',        daysBack: 180 },
    { key: '1y',    label: '1 año',          daysBack: 365 },
];

function computeAsOf(preset: TimeFilterPreset): Date | undefined {
    const def = PRESETS.find((p) => p.key === preset);
    if (!def || def.daysBack === 0) return undefined;
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - def.daysBack);
    return d;
}

export default function TimeFilterPresets({
    value,
    onChange,
    className = '',
}: TimeFilterPresetsProps) {
    // Pre-calcular presets para que sean estables entre renders (evita re-renders innecesarios).
    const presets = useMemo(() => PRESETS, []);

    return (
        <div
            role="tablist"
            aria-label="Filtro temporal"
            className={`flex flex-wrap items-center gap-2 ${className}`}
        >
            {presets.map((p) => {
                const isActive = p.key === value;
                return (
                    <button
                        key={p.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(p.key, computeAsOf(p.key))}
                        className={[
                            'px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest',
                            'transition-all border',
                            isActive
                                ? 'bg-brand text-white border-brand shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-brand/40 hover:text-brand',
                        ].join(' ')}
                    >
                        {p.label}
                    </button>
                );
            })}
        </div>
    );
}
