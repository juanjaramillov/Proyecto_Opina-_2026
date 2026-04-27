import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { metricsService, LeaderboardEntry } from '../services/metricsService';
import TimeFilterPresets, { TimeFilterPreset } from '../../../components/ui/TimeFilterPresets';
import TimeFilterDatePicker from '../../../components/ui/TimeFilterDatePicker';
import { Skeleton } from '../../../components/ui/Skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * LeaderboardWithTimeTravel — ranking con capacidad de viajar en el tiempo.
 *
 * Demuestra el patrón end-to-end del Bloque B:
 *   - B2C: ve 6 presets fijos (Hoy / Semana / Mes / 3m / 6m / 1 año).
 *   - B2B / Admin: ve un date picker para elegir cualquier fecha pasada.
 *
 * Este componente es auto-contenido — maneja su propio fetch, loading,
 * error y filtros. Puede insertarse en cualquier pantalla con una línea:
 *
 *   <LeaderboardWithTimeTravel mode="b2b" limit={20} />
 *
 * Para B2C se usa `mode="b2c"`. La diferencia es solo la UI del filtro
 * temporal; la lógica de data es idéntica.
 */

export interface LeaderboardWithTimeTravelProps {
    /**
     * Modo de presentación del filtro temporal.
     *   - 'b2c': presets fijos (6 botones, tope 1 año).
     *   - 'b2b': date picker libre, sin tope.
     */
    mode?: 'b2c' | 'b2b';
    /**
     * Cantidad máxima de entidades a mostrar. Default 10.
     */
    limit?: number;
    /**
     * Filtro opcional por categoría slug.
     */
    categorySlug?: string;
    /**
     * Título del componente. Default "Ranking".
     */
    title?: string;
}

/**
 * FASE 3D React Query (2026-04-26): el ranking se cachea por queryKey
 * ['metrics','leaderboard',mode,b2cPreset,b2bAsOfTs,limit,categorySlug].
 * Los filtros temporales (preset / date picker) cambian la key y disparan
 * refetch automático — desaparece el useEffect + useCallback(getAsOf).
 * El cálculo de `asOf` vive ahora dentro del queryFn.
 */
export default function LeaderboardWithTimeTravel({
    mode = 'b2c',
    limit = 10,
    categorySlug,
    title = 'Ranking',
}: LeaderboardWithTimeTravelProps) {
    // Estado del filtro temporal
    const [b2cPreset, setB2cPreset] = useState<TimeFilterPreset>('today');
    const [b2bAsOf, setB2bAsOf] = useState<Date | null>(null);

    const b2bAsOfTs = b2bAsOf ? b2bAsOf.getTime() : null;

    const leaderboardQuery = useQuery<LeaderboardEntry[], Error>({
        queryKey: ['metrics', 'leaderboard', mode, b2cPreset, b2bAsOfTs, limit, categorySlug ?? null],
        queryFn: () => {
            // Calcular as_of dentro del queryFn — sin useCallback ni dep-array.
            let asOf: Date | undefined;
            if (mode === 'b2b') {
                asOf = b2bAsOf ?? undefined;
            } else if (b2cPreset !== 'today') {
                const daysMap: Record<TimeFilterPreset, number> = {
                    today: 0,
                    '1w': 7,
                    '1m': 30,
                    '3m': 90,
                    '6m': 180,
                    '1y': 365,
                };
                const d = new Date();
                d.setUTCDate(d.getUTCDate() - daysMap[b2cPreset]);
                asOf = d;
            }
            return metricsService.getGlobalLeaderboard({
                limit,
                asOf,
                categorySlug,
            });
        },
    });

    const entries = leaderboardQuery.data ?? [];
    const loading = leaderboardQuery.isLoading;
    const error = leaderboardQuery.error?.message ?? null;

    // Etiqueta descriptiva del momento consultado (para el header)
    const asOfLabel = (() => {
        if (mode === 'b2b' && b2bAsOf) {
            return `al ${b2bAsOf.toLocaleDateString('es-CL')}`;
        }
        if (mode === 'b2c' && b2cPreset !== 'today') {
            const labels: Record<TimeFilterPreset, string> = {
                today: 'hoy',
                '1w': 'hace 1 semana',
                '1m': 'hace 1 mes',
                '3m': 'hace 3 meses',
                '6m': 'hace 6 meses',
                '1y': 'hace 1 año',
            };
            return labels[b2cPreset];
        }
        return 'hoy';
    })();

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-50">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{title}</h2>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                            Datos acumulados {asOfLabel}
                        </p>
                    </div>
                </div>

                {/* Filtro temporal */}
                {mode === 'b2c' ? (
                    <TimeFilterPresets
                        value={b2cPreset}
                        onChange={(preset) => setB2cPreset(preset)}
                    />
                ) : (
                    <TimeFilterDatePicker
                        value={b2bAsOf}
                        onChange={setB2bAsOf}
                        helperText="Elige cualquier fecha pasada. Déjalo vacío para ver el estado actual."
                    />
                )}
            </div>

            {/* Body */}
            <div className="overflow-x-auto">
                {loading && (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} variant="text" className="w-full h-10 rounded-lg" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="p-6 text-center">
                        <p className="text-sm font-bold text-danger-600">{error}</p>
                    </div>
                )}

                {!loading && !error && entries.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            No hay datos para esta fecha.
                            {mode === 'b2b' && b2bAsOf && (
                                <span className="block mt-1 text-xs text-slate-400">
                                    Prueba con una fecha más reciente.
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {!loading && !error && entries.length > 0 && (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-3">Posición</th>
                                <th className="px-6 py-3">Entidad</th>
                                <th className="px-6 py-3 text-center">Preferencia</th>
                                <th className="px-6 py-3 text-center">Comparaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {entries.map((e, i) => (
                                <tr key={e.entity_id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-400">#{i + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{e.entity_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand text-xs font-black">
                                            {e.preference_share.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs text-slate-500 font-bold">
                                            {e.total_comparisons.toLocaleString('es-CL')}
                                        </span>
                                        <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-400">
                                            <span className="inline-flex items-center gap-0.5">
                                                <TrendingUp className="w-3 h-3" /> {e.wins_count}
                                            </span>
                                            <span className="inline-flex items-center gap-0.5">
                                                <TrendingDown className="w-3 h-3" /> {e.losses_count}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
