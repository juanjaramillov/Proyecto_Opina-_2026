import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';

import { normalizeSignal, NormalizedSignal } from '../services/signalNormalization';

export default function Marathon() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [signals, setSignals] = useState<NormalizedSignal[]>([]);
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);

    const current = signals[idx] ?? null;
    const total = signals.length;

    const styles = {
        page: { background: '#ffffff', width: '100%' } as React.CSSProperties,
        wrap: {
            maxWidth: 900,
            margin: '0 auto',
            padding: '26px 18px 46px 18px',
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            color: '#0B1220',
        } as React.CSSProperties,

        topRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 14,
        } as React.CSSProperties,

        pill: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            color: '#111827',
            fontWeight: 950,
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'none',
        } as React.CSSProperties,

        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            background: '#F3F4F6',
            fontSize: 12,
            fontWeight: 950,
            color: '#111827',
        } as React.CSSProperties,

        hero: {
            border: '1px solid #EEF2F7',
            borderRadius: 22,
            padding: 16,
            background: 'linear-gradient(180deg,#FFFFFF 0%, #FAFAFB 100%)',
            boxShadow: '0 12px 34px rgba(17,24,39,0.06)',
            marginBottom: 14,
        } as React.CSSProperties,

        title: {
            margin: 0,
            fontSize: 18,
            fontWeight: 950,
            letterSpacing: '-0.02em',
        } as React.CSSProperties,

        sub: {
            marginTop: 6,
            fontSize: 12,
            color: '#6B7280',
            lineHeight: 1.5,
        } as React.CSSProperties,

        progressWrap: {
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
        } as React.CSSProperties,

        bar: {
            flex: 1,
            minWidth: 220,
            height: 10,
            borderRadius: 999,
            background: '#EEF2F7',
            overflow: 'hidden',
        } as React.CSSProperties,

        barFill: (pct: number): React.CSSProperties => ({
            height: '100%',
            width: `${Math.max(0, Math.min(100, pct))}%`,
            background: '#111827',
            borderRadius: 999,
        }),

        card: {
            border: '1px solid #EEF2F7',
            borderRadius: 22,
            background: '#FFFFFF',
            boxShadow: '0 12px 34px rgba(17,24,39,0.06)',
            overflow: 'hidden',
        } as React.CSSProperties,

        cover: {
            height: 150,
            background:
                'radial-gradient(circle at 20% 10%, #E0F2FE 0%, transparent 55%), radial-gradient(circle at 80% 20%, #FDE68A 0%, transparent 55%), linear-gradient(180deg,#F8FAFC 0%, #FFFFFF 100%)',
        } as React.CSSProperties,

        inner: { padding: 16 } as React.CSSProperties,

        question: {
            margin: 0,
            fontSize: 22,
            lineHeight: 1.2,
            fontWeight: 950,
            letterSpacing: '-0.02em',
        } as React.CSSProperties,

        grid: {
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 10,
        } as React.CSSProperties,

        option: (active: boolean): React.CSSProperties => ({
            gridColumn: 'span 12',
            border: `1px solid ${active ? '#111827' : '#EEF2F7'}`,
            borderRadius: 16,
            padding: 12,
            background: active ? '#F9FAFB' : '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        }),

        optLabel: {
            margin: 0,
            fontSize: 14,
            fontWeight: 950,
            color: '#111827',
            lineHeight: 1.25,
        } as React.CSSProperties,

        check: (active: boolean): React.CSSProperties => ({
            width: 22,
            height: 22,
            borderRadius: 999,
            border: `2px solid ${active ? '#111827' : '#E5E7EB'}`,
            background: active ? '#111827' : '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 950,
            flexShrink: 0,
        }),

        actions: {
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
        } as React.CSSProperties,

        ghostBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 14,
            background: '#FFFFFF',
            color: '#111827',
            fontWeight: 950,
            fontSize: 13,
            cursor: 'pointer',
            border: '1px solid #E5E7EB',
        } as React.CSSProperties,

        primaryBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 14,
            background: '#111827',
            color: '#FFFFFF',
            fontWeight: 950,
            fontSize: 13,
            cursor: 'pointer',
            border: 'none',
        } as React.CSSProperties,

        toastErr: {
            marginTop: 12,
            border: '1px solid #FECACA',
            background: '#FEF2F2',
            color: '#991B1B',
            borderRadius: 16,
            padding: 12,
            fontSize: 13,
            fontWeight: 900,
        } as React.CSSProperties,

        done: {
            border: '1px solid #D1FAE5',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 22,
            padding: 16,
            boxShadow: '0 12px 34px rgba(17,24,39,0.06)',
        } as React.CSSProperties,
    };

    // Replace useMemo for options with direct access
    const options = current ? current.options : [];

    const progressPct = total ? ((idx) / total) * 100 : 0;

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // 10 señales activas al azar (demo)
                const { data, error: qErr } = await supabase
                    .from('signals')
                    .select('id, question, scale_type, options')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(40);

                if (qErr) throw qErr;

                // mezclar y tomar 10
                const list = (data ?? []).map((r: any) => normalizeSignal(r)); // Normalize here

                // shuffle simple
                for (let i = list.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [list[i], list[j]] = [list[j], list[i]];
                }

                const picked = list.slice(0, 10);

                if (!mounted) return;
                setSignals(picked);
                setIdx(0);
                setSelected(null);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message ?? 'Error cargando modo maratón');
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    async function saveAndNext() {
        if (!current) return;
        if (!selected) {
            setError('Selecciona una opción.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const { error: insErr } = await supabase.from('signal_responses').insert({
                signal_id: current.id,
                option_value: selected,
            });

            if (insErr) throw insErr;

            // siguiente
            const nextIdx = idx + 1;
            setSelected(null);

            if (nextIdx >= total) {
                setIdx(nextIdx); // marca fin
                return;
            }

            setIdx(nextIdx);
        } catch (e: any) {
            setError(e?.message ?? 'Error guardando respuesta');
        } finally {
            setSaving(false);
        }
    }

    const finished = total > 0 && idx >= total;

    return (
        <section style={styles.page}>
            <div style={styles.wrap}>
                <div style={styles.topRow}>
                    <button type="button" style={styles.pill} onClick={() => navigate(-1)}>
                        ← Volver
                    </button>
                    <div style={styles.badge}>⚡ Modo maratón <span style={{ color: '#6B7280', fontWeight: 950 }}>10 señales</span></div>
                </div>

                <div style={styles.hero}>
                    <h1 style={styles.title}>Responde rápido. Cero análisis.</h1>
                    <div style={styles.sub}>
                        Tu objetivo: 10 señales. Si te arrepientes, no hay drama: vuelves atrás.
                    </div>

                    <div style={styles.progressWrap}>
                        <div style={styles.bar}>
                            <div style={styles.barFill(progressPct)} />
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 900 }}>
                            {Math.min(idx + 1, total)} / {total || 10}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div style={{ color: '#6B7280', fontSize: 13, fontWeight: 900 }}>
                        Cargando señales…
                    </div>
                )}

                {!loading && finished && (
                    <div style={styles.done}>
                        <div style={{ fontSize: 16, fontWeight: 950, marginBottom: 6 }}>
                            Listo. Maratón completado.
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>
                            Tus señales ya están en la base.
                        </div>

                        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button type="button" style={styles.ghostBtn} onClick={() => navigate('/signals')}>
                                Volver a Señales
                            </button>
                            <button type="button" style={styles.primaryBtn} onClick={() => window.location.reload()}>
                                Otro maratón →
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !finished && current && (
                    <div style={styles.card}>
                        <div style={styles.cover} />
                        <div style={styles.inner}>
                            <h2 style={styles.question}>{current.question}</h2>

                            <div style={styles.grid}>
                                {options.map((label) => {
                                    const active = selected === label;
                                    return (
                                        <div
                                            key={label}
                                            style={styles.option(active)}
                                            onClick={() => setSelected(label)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <p style={styles.optLabel}>{label}</p>
                                            <div style={styles.check(active)}>{active ? '✓' : ''}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={styles.actions}>
                                <button type="button" style={styles.ghostBtn} disabled={saving} onClick={() => setSelected(null)}>
                                    Limpiar
                                </button>

                                <button type="button" style={styles.primaryBtn} disabled={saving} onClick={saveAndNext}>
                                    {saving ? 'Guardando…' : (idx === total - 1 ? 'Terminar →' : 'Siguiente →')}
                                </button>
                            </div>

                            {error && <div style={styles.toastErr}>{error}</div>}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
