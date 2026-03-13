
import { RedemptionRow } from '../services/adminInvitesService';

interface RedemptionsTableProps {
    redemptions: RedemptionRow[];
}

export function RedemptionsTable({ redemptions }: RedemptionsTableProps) {
    return (
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase tracking-widest bg-slate-50/50">
                <tr>
                    <th className="px-4 py-3 font-bold rounded-tl-xl whitespace-nowrap text-center">Fecha/Hora</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">Código</th>
                    <th className="px-4 py-3 font-bold text-center">Resultado</th>
                    <th className="px-4 py-3 font-bold text-center">Nickname</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">User ID</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap text-center">App Ver.</th>
                    <th className="px-4 py-3 font-bold rounded-tr-xl text-center">User Agent</th>
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
                            <td className="px-4 py-3 text-slate-500 text-xs text-center">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-900 text-center">{r.invite_code_entered}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${r.result === 'success' ? 'bg-emerald-100 text-emerald-800' :
                                    r.result === 'invite_invalid' || r.result === 'invite_already_used' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                    {r.result}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-center">{r.nickname || '-'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs font-mono text-center" title={r.user_id || undefined}>
                                {r.user_id ? `${r.user_id.substring(0, 8)}...` : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs text-center">{r.app_version || '-'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs text-center">
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
    );
}
