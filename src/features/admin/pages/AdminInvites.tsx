import { useEffect, useState } from 'react';
import { adminInvitesService, InviteRow, RedemptionRow } from '../services/adminInvitesService';

export default function AdminInvites() {
    const [tab, setTab] = useState<'invites' | 'redemptions'>('invites');
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [prefix, setPrefix] = useState('OP');

    const fetchInvites = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await adminInvitesService.listInvites(200);
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
        if (tab === 'invites') fetchInvites();
        else fetchRedemptions();
    }, [tab]);

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

    const handleRevoke = async (code: string) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await adminInvitesService.revokeInvite(code);
            if (!res.ok) {
                throw new Error(res.error || 'Failed to revoke invite');
            }
            await fetchInvites();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error revoking invite');
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
                <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
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
                                    <th className="px-4 py-3 font-bold rounded-tl-xl whitespace-nowrap">Código</th>
                                    <th className="px-4 py-3 font-bold">Alias</th>
                                    <th className="px-4 py-3 font-bold">Estado</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Expira (UTC)</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Usado (UTC)</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Usado Por</th>
                                    <th className="px-4 py-3 font-bold whitespace-nowrap">Creado (UTC)</th>
                                    <th className="px-4 py-3 font-bold rounded-tr-xl text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invites.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500 italic">No hay invitaciones registradas.</td>
                                    </tr>
                                ) : (
                                    invites.map((invite) => (
                                        <tr key={invite.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{invite.code}</td>
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
                                            <td className="px-4 py-3 text-slate-500 text-xs">{invite.used_at ? new Date(invite.used_at).toLocaleString() : '-'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono" title={invite.used_by_user_id || undefined}>
                                                {invite.used_by_user_id ? `${invite.used_by_user_id.substring(0, 8)}...` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(invite.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right">
                                                {invite.status === 'active' && !invite.used_by_user_id && (
                                                    <button
                                                        onClick={() => handleRevoke(invite.code)}
                                                        disabled={loading}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-500 rounded px-1"
                                                    >
                                                        REVOCAR
                                                    </button>
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
