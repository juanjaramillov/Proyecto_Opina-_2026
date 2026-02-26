import { useEffect, useState } from 'react';
import { adminInvitesService, InviteRow, RedemptionRow } from '../services/adminInvitesService';
import { supabase } from '../../../supabase/client';

export default function AdminInvites() {
    const [tab, setTab] = useState<'invites' | 'redemptions'>('invites');
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [prefix, setPrefix] = useState('OP');
    const [timeframe, setTimeframe] = useState<'total' | 'today' | 'yesterday' | '7d' | '30d'>('total');
    const [selectedInvites, setSelectedInvites] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<'active' | 'revoked' | 'delete' | null>(null);
    const [confirmRowAction, setConfirmRowAction] = useState<{ id: string, action: 'active' | 'revoked' | 'delete' } | null>(null);

    const fetchInvites = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await adminInvitesService.listInvites(timeframe);
            setInvites(data);
        } catch (err: any) {
            setErrorMsg(err.message || 'Error fetching invites');
        } finally {
            setLoading(false);
        }
    };

    const fetchRedemptions = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await adminInvitesService.listRedemptions(200);
            setRedemptions(data);
        } catch (err: any) {
            setErrorMsg(err.message || 'Error fetching redemptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSelectedInvites(new Set());
        setConfirmAction(null);
        setConfirmRowAction(null);
        if (tab === 'invites') fetchInvites();
        else fetchRedemptions();
    }, [tab, timeframe]);

    const handleGenerate = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            await adminInvitesService.generateInvites(10, prefix);
            await fetchInvites();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error generating invites');
        } finally {
            setLoading(false);
        }
    };

    // @ts-ignore - currentStatus kept for potential future UI optimistic tweaks
    const handleStatusChange = async (inviteId: string, _currentStatus: string, action: 'revoked' | 'active' | 'delete') => {
        setLoading(true);
        setErrorMsg(null);
        setConfirmRowAction(null);
        try {
            if (action === 'delete') {
                await adminInvitesService.deleteInvite(inviteId);
                setInvites(invites.filter((i) => i.id !== inviteId));
            } else {
                const { error } = await (supabase as any).rpc('admin_set_invitation_status', {
                    p_invite_id: inviteId,
                    p_status: action,
                });
                if (error) throw error;
                // Update locally without a full refetch for better UX
                setInvites(invites.map((i) => i.id === inviteId ? { ...i, status: action } : i));
            }
        } catch (err: any) {
            setErrorMsg(err.message || `Error updating invite status to ${action}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyActive = async () => {
        const activeCodes = invites
            .filter((i) => i.status === 'active')
            .map((i) => i.code)
            .join('\n');

        if (!activeCodes) {
            setErrorMsg('No active codes to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(activeCodes);
            alert('Códigos copiados al portapapeles!');
        } catch (err) {
            setErrorMsg('Failed to copy to clipboard');
        }
    };

    const toggleSelectAll = () => {
        if (selectedInvites.size === invites.length && invites.length > 0) {
            setSelectedInvites(new Set());
        } else {
            setSelectedInvites(new Set(invites.map(i => i.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedInvites);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedInvites(newSet);
    };

    const handleBulkAction = async (action: 'active' | 'revoked' | 'delete') => {
        if (selectedInvites.size === 0) return;

        setLoading(true);
        setErrorMsg(null);
        setConfirmAction(null);
        try {
            const promises = Array.from(selectedInvites).map(async (inviteId) => {
                if (action === 'delete') {
                    return adminInvitesService.deleteInvite(inviteId);
                } else {
                    return (supabase as any).rpc('admin_set_invitation_status', {
                        p_invite_id: inviteId,
                        p_status: action,
                    });
                }
            });

            await Promise.all(promises);

            await fetchInvites();
            setSelectedInvites(new Set());
        } catch (err: any) {
            setErrorMsg(err.message || `Error procesando acción masiva`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-ws section-y space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Administrador de Invitaciones</h1>

            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm">
                    {errorMsg}
                </div>
            )}

            <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 mb-6 max-w-sm">
                <button
                    onClick={() => setTab('invites')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${tab === 'invites' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Invitaciones
                </button>
                <button
                    onClick={() => setTab('redemptions')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${tab === 'redemptions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    Redemptions
                </button>
            </div>

            {/* Toolbar Contextual según Tab */}
            {tab === 'invites' && (
                <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
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
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filtro de KPIs</label>
                            <div className="flex flex-wrap gap-2">
                                {(['total', 'today', 'yesterday', '7d', '30d'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTimeframe(t)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${timeframe === t
                                            ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-800 ring-offset-1'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {t === 'total' ? 'Total Histórico' :
                                            t === 'today' ? 'Hoy' :
                                                t === 'yesterday' ? 'Ayer' :
                                                    t === '7d' ? 'Últimos 7 días' :
                                                        'Últimos 30 días'}
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
                                                confirmAction === 'revoked' ? 'bg-amber-600 hover:bg-amber-700' :
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
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                <tr>
                                    <th className="px-4 py-3 font-bold rounded-tl-xl w-10 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                            checked={invites.length > 0 && selectedInvites.size === invites.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                                    <th className="px-4 py-3 font-bold">Alias</th>
                                    <th className="px-4 py-3 font-bold">Estado</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Expira (UTC)</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Usado Por</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Interacciones</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Tiempo(s)</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Sesiones</th>
                                    <th className="px-4 py-3 font-bold rounded-tr-xl text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invites.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500 italic">No hay invitaciones registradas.</td>
                                    </tr>
                                ) : (
                                    invites.map((invite) => (
                                        <tr key={invite.id} className={`hover:bg-slate-50/50 transition-colors ${selectedInvites.has(invite.id) ? 'bg-cyan-50/30' : ''}`}>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                    checked={selectedInvites.has(invite.id)}
                                                    onChange={() => toggleSelect(invite.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">{invite.code}</td>
                                            <td className="px-4 py-3 text-slate-600">{invite.assigned_alias || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${invite.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                                    invite.status === 'used' ? 'bg-cyan-100 text-cyan-800' :
                                                        invite.status === 'revoked' ? 'bg-red-100 text-red-800' :
                                                            'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {invite.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{invite.expires_at ? new Date(invite.expires_at).toLocaleString() : 'Nunca'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono" title={invite.used_by_user_id || undefined}>
                                                {invite.used_by_user_id ? `${invite.used_by_user_id.substring(0, 8)}...` : '-'}
                                                {invite.used_at && <div className="text-[10px] text-slate-400 mt-1">{new Date(invite.used_at).toLocaleDateString()}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-mono text-sm font-bold text-slate-700">{invite.total_interactions ?? '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-mono text-xs text-slate-500">{invite.total_time_spent_seconds ?? '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-mono text-sm font-bold text-slate-700">{invite.total_sessions ?? '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                {confirmRowAction?.id === invite.id ? (
                                                    <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in-95">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                            ¿Seguro?
                                                        </span>
                                                        <button
                                                            onClick={() => setConfirmRowAction(null)}
                                                            disabled={loading}
                                                            className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200"
                                                        >
                                                            NO
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(invite.id, invite.status, confirmRowAction.action)}
                                                            disabled={loading}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${confirmRowAction.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                                                                confirmRowAction.action === 'revoked' ? 'bg-amber-600 hover:bg-amber-700' :
                                                                    'bg-emerald-600 hover:bg-emerald-700'
                                                                }`}
                                                        >
                                                            SÍ
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {invite.status !== 'revoked' && (
                                                            <button
                                                                onClick={() => setConfirmRowAction({ id: invite.id, action: 'revoked' })}
                                                                disabled={loading}
                                                                className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-500 rounded px-1"
                                                            >
                                                                REVOCAR
                                                            </button>
                                                        )}
                                                        {invite.status === 'revoked' && (
                                                            <button
                                                                onClick={() => handleStatusChange(invite.id, invite.status, 'active')}
                                                                disabled={loading}
                                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-500 rounded px-1"
                                                            >
                                                                REACTIVAR
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setConfirmRowAction({ id: invite.id, action: 'delete' })}
                                                            disabled={loading}
                                                            className="text-xs font-bold text-slate-400 hover:text-red-600 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-500 rounded px-1"
                                                            title="Eliminar permanentemente"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px] align-middle">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                <tr>
                                    <th className="px-4 py-3 font-bold rounded-tl-xl whitespace-nowrap">Fecha/Hora</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                                    <th className="px-4 py-3 font-bold">Resultado</th>
                                    <th className="px-4 py-3 font-bold">Nickname</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">User ID</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">App Ver.</th>
                                    <th className="px-4 py-3 font-bold rounded-tr-xl">User Agent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {redemptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">No hay registros de intentos.</td>
                                    </tr>
                                ) : (
                                    redemptions.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{r.invite_code_entered}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${r.result === 'success' ? 'bg-emerald-100 text-emerald-800' :
                                                    r.result === 'invite_invalid' || r.result === 'invite_already_used' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {r.result}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{r.nickname || '-'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono" title={r.user_id || undefined}>
                                                {r.user_id ? `${r.user_id.substring(0, 8)}...` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{r.app_version || '-'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {r.user_agent ? (
                                                    <span title={r.user_agent} className="cursor-help border-b border-dotted border-slate-400">
                                                        {r.user_agent.length > 30 ? `${r.user_agent.substring(0, 30)}...` : r.user_agent}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
