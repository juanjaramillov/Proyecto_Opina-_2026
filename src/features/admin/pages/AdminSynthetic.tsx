import { useState } from 'react';
import {
    Beaker,
    Users,
    Database,
    Trash2,
    PlusCircle,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { useAdminSynthetic } from '../hooks/useAdminSynthetic';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

/**
 * AdminSynthetic
 *
 * Panel para sembrar y borrar datos sintéticos de prueba interna.
 *
 * Uso típico:
 *   1. Crear un batch (label, cantidad de usuarios, notas).
 *   2. Revisar la página con los datos visibles.
 *   3. Borrar el batch (o usar "Limpieza total") antes de la publicación pública.
 *
 * Toda la marca es trazable:
 *   - Email pattern synthetic+<batch>+NNNN@opina.test
 *   - is_synthetic = true en users + user_profiles
 *   - meta.synthetic = true en signal_events
 *
 * Esta página NO debe quedar visible en producción una vez lanzado el sistema.
 */

const DEFAULT_USER_COUNT = 100;
const MAX_USER_COUNT = 1000;
const MIN_USER_COUNT = 1;

export default function AdminSynthetic() {
    const {
        batches,
        loading,
        errorMsg,
        stats,
        refetch,
        handleCreateBatch,
        handleDeleteBatch,
        handleDeleteAllSynthetic,
    } = useAdminSynthetic();

    // Form state
    const [label, setLabel] = useState('');
    const [userCount, setUserCount] = useState<number>(DEFAULT_USER_COUNT);
    const [notes, setNotes] = useState('');

    // Confirm state
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);
    const [pendingDeleteAll, setPendingDeleteAll] = useState(false);

    const labelIsValid = /^[a-zA-Z0-9_-]{2,40}$/.test(label.trim());
    const countIsValid = userCount >= MIN_USER_COUNT && userCount <= MAX_USER_COUNT;
    const canSubmit = labelIsValid && countIsValid && !loading;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        const ok = await handleCreateBatch(label.trim(), userCount, notes.trim() || null);
        if (ok) {
            setLabel('');
            setUserCount(DEFAULT_USER_COUNT);
            setNotes('');
        }
    };

    const onConfirmDeleteBatch = async () => {
        if (!pendingDelete) return;
        const labelToDelete = pendingDelete;
        setPendingDelete(null);
        await handleDeleteBatch(labelToDelete);
    };

    const onConfirmDeleteAll = async () => {
        setPendingDeleteAll(false);
        await handleDeleteAllSynthetic();
    };

    return (
        <div className="w-full px-4 md:px-8 section-y space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <Beaker className="w-6 h-6 text-brand" />
                        <h1 className="text-2xl font-bold text-slate-900">Datos Sintéticos</h1>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Sembrar usuarios y señales de prueba para revisar la plataforma. Todo lo creado aquí queda
                        trazable y se borra completo antes de la publicación.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Banner de aviso */}
            <div className="bg-warning-50 border border-warning-200 text-warning-900 rounded-2xl p-4 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                    <strong>Solo uso interno.</strong> Estos datos son sintéticos. No los uses en producción pública.
                    Antes del lanzamiento, ejecutá <span className="font-mono font-semibold">Limpieza total</span> al
                    final de esta página y verificá que no queden registros con <span className="font-mono">is_synthetic = true</span>.
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<Users className="w-5 h-5" />}
                    label="Usuarios sintéticos vivos"
                    value={stats.totalUsersAlive}
                    accent="brand"
                />
                <KpiCard
                    icon={<Database className="w-5 h-5" />}
                    label="Señales sintéticas vivas"
                    value={stats.totalSignalsAlive}
                    accent="accent"
                />
                <KpiCard
                    icon={<Beaker className="w-5 h-5" />}
                    label="Batches activos"
                    value={stats.totalBatchesAlive}
                    accent="brand"
                />
                <KpiCard
                    icon={<Beaker className="w-5 h-5" />}
                    label="Batches totales (incluye borrados)"
                    value={stats.totalBatchesAll}
                    accent="accent"
                />
            </div>

            {/* Form: crear batch */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <PlusCircle className="w-5 h-5 text-brand" />
                    <h2 className="text-lg font-semibold text-slate-900">Crear nuevo batch</h2>
                </div>
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Label *
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="ej: review-2026-04 o demo-stakeholders"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            maxLength={40}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                            {label.length === 0
                                ? '2 a 40 caracteres: letras, números, _ o -'
                                : labelIsValid
                                    ? 'Válido.'
                                    : 'Inválido: solo [a-zA-Z0-9_-], 2 a 40 chars.'}
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Cantidad de usuarios *
                        </label>
                        <input
                            type="number"
                            value={userCount}
                            onChange={(e) => setUserCount(Number(e.target.value))}
                            min={MIN_USER_COUNT}
                            max={MAX_USER_COUNT}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                            Entre {MIN_USER_COUNT} y {MAX_USER_COUNT}. Cada usuario genera 5–20 señales versus.
                        </p>
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Notas (opcional)
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="ej: para revisión interna del módulo versus"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <div className="md:col-span-12 flex items-center justify-end gap-2">
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusCircle className="w-4 h-4" />
                            {loading ? 'Generando...' : `Crear batch (${userCount} usuarios)`}
                        </button>
                    </div>
                </form>
            </section>

            {/* Tabla de batches */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Batches existentes</h2>
                    <span className="text-xs text-slate-500">
                        {batches.length} total · {stats.totalBatchesAlive} vivos
                    </span>
                </header>

                {errorMsg && (
                    <div className="px-5 py-3 bg-danger-50 text-danger-700 text-sm border-b border-danger-100">
                        {errorMsg}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <Th>Label</Th>
                                <Th>Notas</Th>
                                <Th className="text-right">Usuarios vivos</Th>
                                <Th className="text-right">Señales vivas</Th>
                                <Th>Creado</Th>
                                <Th>Estado</Th>
                                <Th className="text-right">Acciones</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {batches.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                                        No hay batches todavía. Crea uno con el formulario de arriba.
                                    </td>
                                </tr>
                            )}
                            {batches.map((b) => (
                                <tr key={b.id} className={b.is_deleted ? 'bg-slate-50/60' : ''}>
                                    <td className="px-5 py-3 text-sm font-mono text-slate-900">{b.label}</td>
                                    <td className="px-5 py-3 text-sm text-slate-600 max-w-xs truncate" title={b.notes ?? ''}>
                                        {b.notes ?? <span className="text-slate-400 italic">—</span>}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-right tabular-nums text-slate-900">
                                        {b.user_count_alive.toLocaleString()}
                                        <span className="text-slate-400">
                                            {' '}/ {b.user_count_planned.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-right tabular-nums text-slate-900">
                                        {b.signal_count_alive.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-600">
                                        {new Date(b.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-sm">
                                        {b.is_deleted ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                Borrado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                                                Activo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => setPendingDelete(b.label)}
                                            disabled={b.is_deleted || loading}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-danger-700 hover:bg-danger-50 transition text-sm disabled:opacity-30 disabled:hover:bg-transparent"
                                            title={b.is_deleted ? 'Batch ya borrado' : 'Borrar batch'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Danger zone */}
            <section className="bg-white rounded-2xl border border-danger-200 shadow-sm overflow-hidden">
                <header className="px-5 py-4 border-b border-danger-100 bg-danger-50">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-danger-700" />
                        <h2 className="text-lg font-semibold text-danger-900">Zona peligrosa</h2>
                    </div>
                </header>
                <div className="p-5 space-y-3">
                    <p className="text-sm text-slate-700">
                        <strong>Limpieza total</strong> borra TODOS los datos sintéticos de la base —
                        independiente del batch. Pensado para ejecutar una sola vez antes de la publicación pública.
                        Esta acción es irreversible.
                    </p>
                    <button
                        onClick={() => setPendingDeleteAll(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-danger text-white font-medium hover:bg-danger-700 transition disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpieza total de datos sintéticos
                    </button>
                </div>
            </section>

            {/* Diálogos de confirmación */}
            <ConfirmDialog
                open={pendingDelete !== null}
                title="Borrar batch sintético"
                message={`Esto borra todos los usuarios y señales del batch "${pendingDelete}". La acción es irreversible. ¿Continuar?`}
                confirmLabel="Borrar batch"
                cancelLabel="Cancelar"
                danger
                onConfirm={onConfirmDeleteBatch}
                onCancel={() => setPendingDelete(null)}
            />

            <ConfirmDialog
                open={pendingDeleteAll}
                title="Limpieza total de datos sintéticos"
                message="Esto borra TODOS los datos sintéticos de la base. Acción irreversible. Pensada para correr una sola vez antes de la publicación pública. ¿Confirmar?"
                confirmLabel="Sí, borrar todo"
                cancelLabel="Cancelar"
                danger
                onConfirm={onConfirmDeleteAll}
                onCancel={() => setPendingDeleteAll(false)}
            />
        </div>
    );
}

// ----------------------- subcomponents -----------------------

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    accent: 'brand' | 'accent';
}

function KpiCard({ icon, label, value, accent }: KpiCardProps) {
    const iconWrapClass =
        accent === 'brand'
            ? 'bg-brand-50 text-brand'
            : 'bg-accent-50 text-accent';
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrapClass}`}>
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">{value.toLocaleString()}</div>
            </div>
        </div>
    );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th
            className={`px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left ${className ?? ''}`}
        >
            {children}
        </th>
    );
}
