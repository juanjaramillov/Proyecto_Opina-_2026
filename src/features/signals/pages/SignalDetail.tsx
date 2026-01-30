import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { demoStore } from "../utils/demoData";
import { signalService } from "../../../services/signalService";
import { useBattleKpis } from "../../../hooks/useBattleKpis";
import { useSignalLoader } from "../hooks/useSignalLoader";
import { QualityBadge } from "../../../components/QualityBadge";

export default function SignalDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Use Loader Hook (Separation of Concerns)
    const { signal, source, loading, error } = useSignalLoader(id);

    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [savedOk, setSavedOk] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Para refrescar KPIs después de votar
    const [kpiRefreshKey, setKpiRefreshKey] = useState(0);

    // KPIs (histórico por battle_id)
    const { share, trend, quality, loading: kpiLoading, error: kpiError } = useBattleKpis(
        signal?.battle_id ?? null,
        "30d",
        kpiRefreshKey
    );

    const optionLabels = useMemo(() => {
        if (!signal) return [];
        const raw = Array.isArray(signal.options) ? signal.options : [];
        const labels = raw.map((o) => String(o?.label ?? "").trim()).filter(Boolean);

        if (labels.length) return labels;

        // Strict Fallbacks based of explicit scale_type
        if (signal.scale_type === "binary") return ["Sí", "No"];
        if (signal.scale_type === "emoji") return ["😡", "😕", "😐", "🙂", "😍"];
        if (signal.scale_type === "numeric") return ["1", "2", "3", "4", "5"];

        // Default fallback (no inference)
        return ["Opción A", "Opción B"];
    }, [signal]);

    async function saveResponse() {
        if (!selected) {
            setSaveError("Selecciona una opción.");
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);

            if (source === "demo") {
                if (signal && signal.options) {
                    const optIndex = signal.options.findIndex((o) => o?.label === selected);
                    if (optIndex >= 0 && signal.id) demoStore.vote(signal.id, optIndex);
                }
                await new Promise((r) => setTimeout(r, 600));
            } else {
                if (signal) {
                    const optionObj = (signal.options as any[])?.find((o) => o.label === selected);
                    const optionId = optionObj?.id;

                    await signalService.saveSignalEvent({
                        source_type: (signal.signal_type as any) === "versus" ? "versus" : "review",
                        source_id: signal.id,
                        title: signal.question,
                        choice_label: selected,
                        battle_id: signal.battle_id,
                        battle_instance_id: signal.battle_instance_id,
                        option_id: optionId,
                        signal_weight: 1.0,
                    });

                    // refrescar KPIs (el hook ya trae por battle_id en 30d)
                    setKpiRefreshKey((k) => k + 1);
                }
            }

            setSavedOk(true);
        } catch (e: any) {
            setSaveError(e?.message ?? "Error guardando respuesta");
            setSavedOk(false);
        } finally {
            setSaving(false);
        }
    }

    const getSharePct = (label: string) => {
        if (!share.length) return null;

        const opt = (signal?.options as any[])?.find((o) => o.label === label);
        if (!opt?.id) return null;

        const row = share.find((s) => s.option_id === opt.id);
        if (!row) return 0;

        // share viene 0..1
        const pct = row.share * 100;
        return Math.round(pct);
    };

    const velocityStats = useMemo(() => {
        if (!trend || !trend.length) return null;
        // Sum all deltas to get net velocity
        const totalDelta = trend.reduce((acc, row) => acc + (row.delta || 0), 0);
        return { totalDelta };
    }, [trend]);

    return (
        <section className="min-h-screen w-full bg-white">
            <div className="max-w-4xl mx-auto px-4 py-4 font-sans text-gray-900">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-3 py-2.5 rounded-full border border-gray-200 bg-white text-gray-900 text-[13px] font-black hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        ← Volver
                    </button>

                    {signal?.scale_type && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-black text-gray-900">
                            {source === "demo" ? <span className="mr-1.5">⚡ Demo •</span> : <span className="mr-1.5 text-green-600">● Live •</span>}
                            Señal <span className="text-gray-500 font-black ml-1 uppercase">{signal.scale_type}</span>
                        </div>
                    )}
                </div>

                <div className="border border-gray-100 rounded-3xl bg-white shadow-xl overflow-hidden">
                    <div className="h-44 relative bg-[radial-gradient(circle_at_20%_10%,_#E0F2FE_0%,_transparent_55%),radial-gradient(circle_at_80%_20%,_#FDE68A_0%,_transparent_55%),linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)]" />

                    <div className="p-4 sm:p-6">
                        {loading && <div className="text-gray-500 text-[13px] font-black animate-pulse">Cargando…</div>}

                        {!loading && signal && (
                            <>
                                <h1 className="text-2xl font-black leading-[1.2] tracking-tight m-0 mb-2">{signal.question}</h1>
                                <div className="text-[13px] text-gray-500 leading-relaxed mb-6">Elige una opción y listo. Tu señal queda registrada.</div>

                                {/* Opciones */}
                                <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-6">
                                    {optionLabels.map((label) => {
                                        const active = selected === label;
                                        const sharePct = getSharePct(label);
                                        const hasRealStats = sharePct !== null;

                                        return (
                                            <div
                                                key={label}
                                                onClick={() => setSelected(label)}
                                                role="button"
                                                tabIndex={0}
                                                className={`
                          col-span-12 border rounded-2xl p-3 sm:p-4 cursor-pointer flex items-center justify-between gap-3 transition-all relative overflow-hidden
                          ${active ? "border-gray-900 bg-gray-50 shadow-md transform scale-[1.01]" : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200"}
                        `}
                                            >
                                                {hasRealStats && (
                                                    <div
                                                        className="absolute inset-0 bg-gray-100/50 transition-all duration-700 ease-out z-0 pointer-events-none"
                                                        style={{ width: `${sharePct}%` }}
                                                    />
                                                )}

                                                <div className="min-w-0 z-10 relative">
                                                    <p className="m-0 text-sm font-black text-gray-900 leading-tight">{label}</p>
                                                    <div className="mt-1.5 text-xs text-gray-500 flex items-center gap-2">
                                                        {signal.scale_type === "versus" ? "Versus" : "Tap para elegir"}
                                                        {hasRealStats && (
                                                            <span className="font-bold text-gray-700 bg-white/80 px-1.5 rounded shadow-sm">
                                                                {sharePct}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors z-10 ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white"}`}>
                                                    {active && <span className="text-xs font-bold">✓</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* KPIs */}
                                {signal.battle_id && (
                                    <div className="mb-6 grid grid-cols-12 gap-3">
                                        {/* Quality */}
                                        <div className="col-span-12 sm:col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider m-0">Quality</h3>
                                                    <QualityBadge userTier="guest" profileCompleteness={0} />
                                                </div>
                                                {kpiLoading && <span className="text-[11px] font-black text-slate-400">cargando…</span>}
                                            </div>

                                            {kpiError && (
                                                <div className="text-[12px] font-black text-red-600">{kpiError}</div>
                                            )}

                                            {!kpiError && quality.length === 0 && (
                                                <div className="text-[12px] font-black text-slate-400">Sin datos todavía.</div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                {quality.slice(0, 6).map((q) => (
                                                    <div key={q.metric_key} className="bg-white border border-slate-100 rounded-xl p-3">
                                                        <div className="text-[10px] uppercase font-black text-slate-400">{q.metric_label}</div>
                                                        <div className="text-xl font-black text-slate-900">{Number.isFinite(q.metric_value) ? q.metric_value : 0}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Velocity / Momentum */}
                                        <div className="col-span-12 sm:col-span-6 p-4 rounded-2xl bg-white border border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider m-0">Velocidad (24h)</h3>
                                                {kpiLoading && <span className="text-[11px] font-black text-gray-400">cargando…</span>}
                                            </div>

                                            {!kpiError && !velocityStats && (
                                                <div className="text-[12px] font-black text-gray-400">Sin cambios recientes.</div>
                                            )}

                                            {velocityStats && (
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={`text-3xl font-black ${velocityStats.totalDelta >= 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {velocityStats.totalDelta > 0 ? '+' : ''}{velocityStats.totalDelta}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500">señales vs ayer</span>
                                                    </div>
                                                    <div className="mt-2 text-[11px] text-gray-400 leading-tight">
                                                        Cambio en el volumen de señales en las últimas 24 horas.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex items-center justify-between gap-3 flex-wrap mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-gray-900 text-[13px] font-black border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Limpiar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={saveResponse}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white text-[13px] font-black hover:bg-black transition-transform active:scale-95 cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Guardando…" : "Enviar señal →"}
                                    </button>
                                </div>

                                {savedOk && (
                                    <div className="mt-4 border border-green-200 bg-green-50 text-green-800 rounded-2xl p-3 text-[13px] font-extrabold">
                                        Listo. Señal registrada.
                                    </div>
                                )}
                            </>
                        )}

                        {!loading && !signal && error && (
                            <div className="mt-4 border border-red-200 bg-red-50 text-red-800 rounded-2xl p-3 text-[13px] font-extrabold">{error}</div>
                        )}
                        {!loading && signal && (error || saveError) && (
                            <div className="mt-4 border border-red-200 bg-red-50 text-red-800 rounded-2xl p-3 text-[13px] font-extrabold">{error ?? saveError}</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
