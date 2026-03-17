
import { InviteRow } from '../services/adminInvitesService';

interface InvitesTableProps {
    sortedInvites: InviteRow[];
    selectedInvites: Set<string>;
    toggleSelectAll: () => void;
    toggleSelect: (id: string) => void;
    handleSort: (key: keyof InviteRow) => void;
    sortConfig: { key: keyof InviteRow; direction: 'asc' | 'desc' } | null;
    waDrafts: Record<string, { phone: string; isSending: boolean; statusMsg?: string }>;
    updateWaDraft: (id: string, updates: Partial<{ phone: string; isSending: boolean; statusMsg?: string }>) => void;
    handleSendWhatsApp: (invite: InviteRow) => void;
    confirmRowAction: { id: string, action: 'active' | 'revoked' | 'delete' } | null;
    setConfirmRowAction: (action: { id: string, action: 'active' | 'revoked' | 'delete' } | null) => void;
    handleStatusChange: (inviteId: string, currentStatus: string, action: 'revoked' | 'active' | 'delete') => void;
    loading: boolean;
}

export function InvitesTable({
    sortedInvites, selectedInvites, toggleSelectAll, toggleSelect,
    handleSort, sortConfig, waDrafts, updateWaDraft, handleSendWhatsApp,
    confirmRowAction, setConfirmRowAction, handleStatusChange, loading
}: InvitesTableProps) {

    const renderSortIcon = (key: keyof InviteRow) => {
        if (sortConfig?.key !== key) return <span className="text-slate-300 ml-1 text-[12px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="text-cyan-600 ml-1 text-[12px] font-bold">↑</span> 
            : <span className="text-cyan-600 ml-1 text-[12px] font-bold">↓</span>;
    };

    return (
        <table className="w-full text-sm text-left">
            <thead className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <tr>
                    <th className="px-2 py-3 font-bold rounded-tl-xl w-8 text-center">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                            checked={sortedInvites.length > 0 && selectedInvites.size === sortedInvites.length}
                            onChange={toggleSelectAll}
                        />
                    </th>
                    <th className="px-1 py-3 w-6 text-center"></th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('code')}>
                        <div className="flex items-center justify-center whitespace-nowrap">Código {renderSortIcon('code')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('used_by_nickname')}>
                        <div className="flex items-center justify-center">Alias {renderSortIcon('used_by_nickname')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('status')}>
                        <div className="flex items-center justify-center">Estado {renderSortIcon('status')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('expires_at')}>
                        <div className="flex items-center justify-center whitespace-nowrap">Expira {renderSortIcon('expires_at')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('last_active_at')}>
                        <div className="flex items-center justify-center">Última Conexión {renderSortIcon('last_active_at')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('total_sessions')}>
                        <div className="flex items-center justify-center">Sesiones {renderSortIcon('total_sessions')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('total_interactions')}>
                        <div className="flex items-center justify-center">Señales {renderSortIcon('total_interactions')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => handleSort('total_time_spent_seconds')}>
                        <div className="flex items-center justify-center">Minutos {renderSortIcon('total_time_spent_seconds')}</div>
                    </th>
                    <th className="px-2 py-3 font-bold text-center">WhatsApp</th>
                    <th className="px-2 py-3 font-bold rounded-tr-xl whitespace-nowrap text-center w-24">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {sortedInvites.length === 0 ? (
                    <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-slate-500 italic">No hay invitaciones registradas.</td>
                    </tr>
                ) : (
                    sortedInvites.map((invite) => (
                        <tr key={invite.id} className={`hover:bg-slate-50/50 transition-colors ${selectedInvites.has(invite.id) ? 'bg-cyan-50/30' : ''}`}>
                            <td className="px-2 py-3 text-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                    checked={selectedInvites.has(invite.id)}
                                    onChange={() => toggleSelect(invite.id)}
                                />
                            </td>
                            <td className="px-1 py-3 text-center">
                                <div
                                    className={`w-2 h-2 rounded-full mx-auto ${invite.used_by_user_id
                                        ? (invite.last_active_at && (Date.now() - new Date(invite.last_active_at).getTime()) < 5 * 60 * 1000)
                                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                                            : 'bg-red-500 bg-opacity-80'
                                        : 'bg-slate-200'
                                        }`}
                                    title={invite.used_by_user_id ? (invite.last_active_at && (Date.now() - new Date(invite.last_active_at).getTime()) < 5 * 60 * 1000 ? `Online` : 'Offline') : 'No usada'}
                                />
                            </td>
                            <td className="px-2 py-3 font-mono font-medium text-slate-900 whitespace-nowrap text-[11px] lg:text-sm text-center">{invite.code}</td>
                            <td className="px-2 py-3 text-slate-600 text-center text-[11px] lg:text-xs">
                                {invite.used_by_nickname ? (
                                    <span className="font-bold text-primary-600">{invite.used_by_nickname}</span>
                                ) : (
                                    '-'
                                )}
                            </td>
                            <td className="px-2 py-3 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${invite.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                    invite.status === 'used' ? 'bg-cyan-100 text-cyan-800' :
                                        invite.status === 'revoked' ? 'bg-red-100 text-red-800' :
                                            'bg-slate-100 text-slate-800'
                                    }`}>
                                    {invite.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-2 py-3 text-slate-500 text-[10px] md:text-xs whitespace-nowrap text-center">
                                {invite.expires_at ? new Date(invite.expires_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                            </td>
                            <td className="px-2 py-3 text-center">
                                <span className="font-mono text-[10px] md:text-xs text-slate-500">
                                    {invite.last_active_at ? new Date(invite.last_active_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                            </td>
                            <td className="px-2 py-3 text-center">
                                <span className="font-mono text-[11px] md:text-sm font-bold text-slate-700">{invite.total_sessions ?? '-'}</span>
                            </td>
                            <td className="px-2 py-3 text-center">
                                <span className="font-mono text-[11px] md:text-sm font-bold text-slate-700">{invite.total_interactions ?? '-'}</span>
                            </td>
                            <td className="px-2 py-3 text-center">
                                <span className="font-mono text-[11px] md:text-sm font-bold text-slate-700">
                                    {invite.total_time_spent_seconds ? (invite.total_time_spent_seconds / 60).toFixed(1) : '-'}
                                </span>
                            </td>
                            <td className="px-2 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="flex gap-1 w-[130px] shrink-0">
                                        <input
                                            type="text"
                                            placeholder="+569..."
                                            value={waDrafts[invite.id]?.phone ?? invite.whatsapp_phone ?? ''}
                                            onChange={(e) => updateWaDraft(invite.id, { phone: e.target.value })}
                                            className="w-full text-[10px] px-2 py-1 border rounded-lg focus:ring-1 focus:ring-cyan-500 outline-none"
                                            disabled={waDrafts[invite.id]?.isSending}
                                        />
                                        <button
                                            onClick={() => handleSendWhatsApp(invite)}
                                            disabled={waDrafts[invite.id]?.isSending || !(waDrafts[invite.id]?.phone || invite.whatsapp_phone)}
                                            className="bg-emerald-500 text-white rounded-lg p-1 hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                                            title="Enviar invitación por WhatsApp"
                                        >
                                            {waDrafts[invite.id]?.isSending ? (
                                                <span className="animate-spin text-[14px] material-symbols-outlined">sync</span>
                                            ) : (
                                                <span className="text-[14px] material-symbols-outlined">send</span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-[9px] flex items-center gap-1 text-left w-[80px] shrink-0">
                                        {(waDrafts[invite.id]?.statusMsg || invite.whatsapp_status) && (
                                            <>
                                                <span className={`font-bold whitespace-nowrap ${waDrafts[invite.id]?.statusMsg?.includes('Error') || invite.whatsapp_status === 'error' ? 'text-red-500' : 'text-emerald-600'
                                                    }`}>
                                                    {waDrafts[invite.id]?.statusMsg || (invite.whatsapp_status === 'sent' ? 'Enviado ✅' : invite.whatsapp_status)}
                                                </span>
                                                {invite.whatsapp_error && (
                                                    <span className="text-red-400 truncate max-w-[80px]" title={invite.whatsapp_error}>
                                                        ({invite.whatsapp_error})
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-2 py-3 text-center whitespace-nowrap">
                                {confirmRowAction?.id === invite.id ? (
                                    <div className="flex items-center justify-center gap-1.5 animate-in fade-in zoom-in-95">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase hidden sm:inline">
                                            ¿Seguro?
                                        </span>
                                        <button
                                            onClick={() => setConfirmRowAction(null)}
                                            disabled={loading}
                                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200"
                                        >
                                            NO
                                        </button>
                                        <button
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            onClick={() => handleStatusChange(invite.id, invite.status, confirmRowAction.action as any)}
                                            disabled={loading}
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${confirmRowAction.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                                                confirmRowAction.action === 'revoked' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    'bg-emerald-600 hover:bg-emerald-700'
                                                }`}
                                        >
                                            SÍ
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1 flex-nowrap">
                                        {invite.status !== 'revoked' && (
                                            <button
                                                onClick={() => setConfirmRowAction({ id: invite.id, action: 'revoked' })}
                                                disabled={loading}
                                                className="text-[10px] font-bold text-red-600 hover:text-red-700 disabled:opacity-50 focus:outline-none rounded px-1"
                                            >
                                                REVOCAR
                                            </button>
                                        )}
                                        {invite.status === 'revoked' && (
                                            <button
                                                onClick={() => handleStatusChange(invite.id, invite.status, 'active')}
                                                disabled={loading}
                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 focus:outline-none rounded px-1"
                                            >
                                                REACTIVAR
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setConfirmRowAction({ id: invite.id, action: 'delete' })}
                                            disabled={loading}
                                            className="text-slate-400 hover:text-red-600 disabled:opacity-50 focus:outline-none rounded px-1 flex items-center justify-center"
                                            title="Eliminar permanentemente"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">delete</span>
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
