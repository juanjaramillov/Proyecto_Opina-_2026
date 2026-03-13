import { useState, useEffect, useCallback } from "react";
import { Search, UserCircle, Shield, Activity, Star, Medal, MoreVertical } from "lucide-react";
import { adminUsersService, AdminUserRow } from "../services/adminUsersService";
import { logger } from "../../../lib/logger";

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminUsersService.searchUsers(debouncedSearch);
            setUsers(data);
        } catch (err) {
            logger.error("Failed to load users for CRM", { domain: 'admin_actions', origin: 'AdminUsers' }, err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`¿Cambiar rol de este usuario a ${newRole.toUpperCase()}?`)) return;

        try {
            await adminUsersService.updateRole(userId, newRole as 'user' | 'admin' | 'b2b');
            setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert("Error al cambiar el rol. Posible falta de permisos RLS o fallo de red.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
                    <UserCircle className="w-64 h-64 rotate-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 border border-emerald-100/50">
                                <UserCircle className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CRM de Usuarios</h1>
                        </div>
                        <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                            Busca, audita y administra a los miembros de la comunidad Opina+. 
                            Ajusta roles, verifica interacciones y gestiona el estado de sus cuentas.
                        </p>
                    </div>
                    
                    <div className="flex bg-slate-50 border border-slate-200 rounded-2xl p-4 gap-6 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Encontrados</span>
                            <span className="text-2xl font-black text-slate-800">{loading ? '-' : users.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nickname..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-sm font-semibold transition-all outline-none"
                    />
                </div>
                <button
                    onClick={fetchUsers}
                    className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                    Refrescar
                </button>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rol</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Interacciones</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No se encontraron usuarios coincidiendo con "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black shadow-inner shrink-0">
                                                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        {user.nickname || 'Sin Nickname'}
                                                        {user.is_identity_verified && (
                                                            <span title="Identidad Verificada">
                                                                <Medal className="w-4 h-4 text-amber-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5" title={user.user_id}>
                                                        {user.user_id.split('-')[0]}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                    : user.role === 'b2b'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                {user.role === 'b2b' && <Star className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                <span className="font-bold text-slate-700">{user.total_interactions.toLocaleString()}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                Registrado: {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleRoleChange(user.user_id, user.role)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
                                                    title="Ascender/Descender a Admin"
                                                >
                                                    {user.role === 'admin' ? 'Revocar Admin' : 'Hacer Admin'}
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
