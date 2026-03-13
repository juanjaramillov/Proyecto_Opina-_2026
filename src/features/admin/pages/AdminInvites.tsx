import { useAdminInvites } from '../hooks/useAdminInvites';
import { useIntelligence } from '../../intelligence/hooks/useIntelligence';
import { InvitesTable } from '../components/InvitesTable';
import { RedemptionsTable } from '../components/RedemptionsTable';
import { Users, Ticket, AlertTriangle, UserPlus, Clock, Database } from 'lucide-react';

export default function AdminInvites() {
    const {
        tab, setTab,
        invites, redemptions,
        loading, errorMsg,
        prefix, setPrefix,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        selectedInvites,
        confirmAction, setConfirmAction,
        confirmRowAction, setConfirmRowAction,
        waDrafts, sortConfig,
        handleSort, sortedInvites,
        updateWaDraft, handleSendWhatsApp,
        fetchInvites, fetchRedemptions,
        handleGenerate, handleStatusChange,
        handleCopyActive, toggleSelectAll, toggleSelect,
        handleBulkAction, stats: localStats
    } = useAdminInvites();

    // Traer stats y KPIs de toda la plataforma
    const { stats: globalStats, kpis: globalKpis, loading: loadingGlobal } = useIntelligence();

    return (
        <div className="w-full px-4 md:px-8 section-y space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Administrador de Invitaciones</h1>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-2">
                {/* Métricas Globales de Plataforma */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usuarios Activos (Online)</div>
                        <div className="text-2xl font-bold text-slate-900">
                           {loadingGlobal ? '...' : (globalStats?.active_users || 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 text-teal-500 shrink-0">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usuarios Activos (7d - WAU)</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {loadingGlobal ? '...' : (globalKpis?.wau || 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usuarios Activos (24h - DAU)</div>
                        <div className="text-2xl font-bold text-slate-900">
                             {loadingGlobal ? '...' : (globalKpis?.dau || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 text-rose-500 shrink-0">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Señales Procesadas (24h)</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {loadingGlobal ? '...' : (globalStats?.signals_24h || 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Métricas de Invitaciones (Originales) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500 shrink-0">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Entradas</div>
                        <div className="text-2xl font-bold text-slate-900">{localStats.total}</div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Conversión</div>
                        <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
                            {localStats.conversionRate.toFixed(1)}%
                            <span className="text-sm font-medium text-slate-500">
                                ({localStats.used})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 cursor-pointer hover:border-orange-200 transition-colors" onClick={() => { setTab('invites'); setStatusFilter('abandoned'); }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Abandonos</div>
                        <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
                            {localStats.abandoned}
                            <span className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
                                (WA)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm">
                    {errorMsg}
                </div>
            )}

            <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 mb-6 max-w-sm">
                <button
                    onClick={() => setTab('invites')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 ${tab === 'invites' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Invitaciones
                </button>
                <button
                    onClick={() => setTab('redemptions')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 ${tab === 'redemptions' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Redemptions
                </button>
            </div>

            {/* Toolbar Contextual según Tab */}
            {tab === 'invites' && (
                <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full sm:w-auto">
                            <label htmlFor="search-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Buscar</label>
                            <input
                                id="search-input"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchInvites()}
                                className="w-full h-10 px-4 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-0 transition-colors"
                                placeholder="Código, Alias o Teléfono..."
                            />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <label htmlFor="prefix-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Prefijo</label>
                            <input
                                id="prefix-input"
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                className="w-full h-10 px-4 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-0 transition-colors font-mono"
                                placeholder="OP"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="h-10 px-6 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500"
                        >
                            {loading ? 'Generando...' : 'Generar 10'}
                        </button>
                        <button
                            onClick={fetchInvites}
                            disabled={loading}
                            className="h-10 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
                        >
                            {loading ? 'Cargando...' : 'Refrescar'}
                        </button>
                        <button
                            onClick={handleCopyActive}
                            disabled={loading || invites.length === 0}
                            className="h-10 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-black disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                        >
                            Copiar Activos
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estado</label>
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'pending', 'in_use', 'abandoned', 'revoked'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setStatusFilter(t)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${statusFilter === t
                                            ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-800 ring-offset-1'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {t === 'all' ? 'Todos' :
                                            t === 'pending' ? 'Pendientes' :
                                                t === 'in_use' ? 'En Uso' :
                                                    t === 'abandoned' ? 'Abandonados' :
                                                        'Revocados'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedInvites.size > 0 && (
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-sm font-bold text-slate-600 px-2">{selectedInvites.size} selec.</span>

                                {confirmAction ? (
                                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                        <span className="text-xs font-bold text-slate-500">
                                            {confirmAction === 'delete' ? '¿Eliminar permanentemente?' :
                                                confirmAction === 'revoked' ? '¿Revocar códigos?' : '¿Reactivar códigos?'}
                                        </span>
                                        <button
                                            onClick={() => setConfirmAction(null)}
                                            disabled={loading}
                                            className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction(confirmAction)}
                                            disabled={loading}
                                            className={`px-3 py-1 rounded-md text-white text-xs font-bold disabled:opacity-50 ${confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                                                confirmAction === 'revoked' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    'bg-emerald-600 hover:bg-emerald-700'
                                                }`}
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setConfirmAction('active')}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                        >
                                            Reactivar
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction('revoked')}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                                        >
                                            Revocar
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction('delete')}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1"
                                            title="Eliminar permanentemente"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'redemptions' && (
                <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={fetchRedemptions}
                        disabled={loading}
                        className="h-10 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
                    >
                        {loading ? 'Cargando...' : 'Refrescar Redemptions'}
                    </button>
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {tab === 'invites' ? (
                        <InvitesTable
                            sortedInvites={sortedInvites}
                            selectedInvites={selectedInvites}
                            toggleSelectAll={toggleSelectAll}
                            toggleSelect={toggleSelect}
                            handleSort={handleSort}
                            sortConfig={sortConfig}
                            waDrafts={waDrafts}
                            updateWaDraft={updateWaDraft}
                            handleSendWhatsApp={handleSendWhatsApp}
                            confirmRowAction={confirmRowAction}
                            setConfirmRowAction={setConfirmRowAction}
                            handleStatusChange={handleStatusChange}
                            loading={loading}
                        />
                    ) : (
                        <RedemptionsTable redemptions={redemptions} />
                    )}
                </div>
            </div>
        </div>
    );
}
