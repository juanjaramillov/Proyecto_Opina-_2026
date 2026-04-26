import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminInvitesService, InviteRow, RedemptionRow } from '../services/adminInvitesService';
import { typedRpc } from '../../../supabase/typedRpc';

export type StatusFilterType = 'all' | 'pending' | 'in_use' | 'abandoned' | 'revoked';

export function useAdminInvites() {
    const [tab, setTab] = useState<'invites' | 'redemptions'>('invites');
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [prefix, setPrefix] = useState('OP');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvites, setSelectedInvites] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<'active' | 'revoked' | 'delete' | null>(null);
    const [confirmRowAction, setConfirmRowAction] = useState<{ id: string, action: 'active' | 'revoked' | 'delete' } | null>(null);
    const [waDrafts, setWaDrafts] = useState<Record<string, { phone: string; isSending: boolean; statusMsg?: string }>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof InviteRow; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: keyof InviteRow) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedInvites = useMemo(() => {
        const sortableItems = [...invites];

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
             const priority: Record<string, number> = {
                'used': 1,
                'active': 2,
                'revoked': 3
            };
    
            sortableItems.sort((a, b) => {
                const pA = priority[a.status] || 99;
                const pB = priority[b.status] || 99;
    
                if (pA !== pB) return pA - pB;
    
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }
        return sortableItems;
    }, [invites, sortConfig]);

    const updateWaDraft = (id: string, updates: Partial<{ phone: string; isSending: boolean; statusMsg?: string }>) => {
        setWaDrafts(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { phone: '', isSending: false }), ...updates }
        }));
    };

    const handleSendWhatsApp = async (invite: InviteRow) => {
        const draft = waDrafts[invite.id];
        if (!draft?.phone || !draft.phone.startsWith('+')) {
            toast.error('Ingresá un teléfono válido con formato +... (ej: +56912345678)');
            return;
        }

        updateWaDraft(invite.id, { isSending: true, statusMsg: undefined });
        try {
            const res = await adminInvitesService.sendWhatsAppInvite(invite.id, draft.phone);
            if (res.success) {
                updateWaDraft(invite.id, { isSending: false, statusMsg: 'Enviado ✅' });
                setInvites(prev => prev.map(i => i.id === invite.id ? {
                    ...i,
                    whatsapp_phone: draft.phone,
                    whatsapp_status: 'sent',
                    whatsapp_sent_at: new Date().toISOString()
                } : i));
            } else {
                const detailObj = res.detail as { error?: { message?: string } } | undefined;
                const detailMsg = detailObj?.error?.message || res.error || 'Fallo desconocido';
                updateWaDraft(invite.id, { isSending: false, statusMsg: `Error: ${detailMsg.substring(0, 100)}` });
            }
        } catch (err: unknown) {
            updateWaDraft(invite.id, { isSending: false, statusMsg: `Error: ${(err as Error).message}` });
        }
    };

    const fetchInvites = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await adminInvitesService.listInvites(statusFilter, searchTerm);
            setInvites(data);
        } catch (err: unknown) {
            setErrorMsg((err as Error).message || 'Error fetching invites');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    const fetchRedemptions = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await adminInvitesService.listRedemptions(200);
            setRedemptions(data);
        } catch (err: unknown) {
            setErrorMsg((err as Error).message || 'Error fetching redemptions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setSelectedInvites(new Set());
        setConfirmAction(null);
        setConfirmRowAction(null);
        if (tab === 'invites') fetchInvites();
        else fetchRedemptions();
    }, [tab, statusFilter, fetchInvites, fetchRedemptions]);

    const handleGenerate = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            await adminInvitesService.generateInvites(10, prefix);
            await fetchInvites();
        } catch (err: unknown) {
            setErrorMsg((err as Error).message || 'Error generating invites');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (inviteId: string, _currentStatus: string, action: 'revoked' | 'active' | 'delete') => {
        setLoading(true);
        setErrorMsg(null);
        setConfirmRowAction(null);
        try {
            if (action === 'delete') {
                await adminInvitesService.deleteInvite(inviteId);
                setInvites(invites.filter((i) => i.id !== inviteId));
            } else {
                const { error } = await typedRpc<unknown>('admin_set_invitation_status', {
                    p_invite_id: inviteId,
                    p_status: action,
                });
                if (error) throw error;
                setInvites(invites.map((i) => i.id === inviteId ? { ...i, status: action } : i));
            }
        } catch (err: unknown) {
            setErrorMsg((err as Error).message || `Error updating invite status to ${action}`);
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
            toast.success('Códigos copiados al portapapeles');
        } catch {
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
                    return typedRpc<unknown>('admin_set_invitation_status', {
                        p_invite_id: inviteId,
                        p_status: action,
                    });
                }
            });

            await Promise.all(promises);

            await fetchInvites();
            setSelectedInvites(new Set());
        } catch (err: unknown) {
            setErrorMsg((err as Error).message || `Error procesando acción masiva`);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = invites.length;
        const used = invites.filter(i => i.status === 'used').length;
        const active = invites.filter(i => i.status === 'active').length;
        // Consider abandonment as those sent via WA but not used, or explicitly with abandoned status
        const abandoned = invites.filter(i => i.status === 'abandoned' || (i.status === 'active' && i.whatsapp_status === 'sent')).length;
        const conversionRate = total > 0 ? (used / total) * 100 : 0;

        return { total, used, active, abandoned, conversionRate };
    }, [invites]);

    return {
        tab, setTab,
        invites, redemptions,
        loading, errorMsg,
        prefix, setPrefix,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        selectedInvites, setSelectedInvites,
        confirmAction, setConfirmAction,
        confirmRowAction, setConfirmRowAction,
        waDrafts, sortConfig,
        handleSort, sortedInvites,
        updateWaDraft, handleSendWhatsApp,
        fetchInvites, fetchRedemptions,
        handleGenerate, handleStatusChange,
        handleCopyActive, toggleSelectAll, toggleSelect,
        handleBulkAction, stats
    };
}
