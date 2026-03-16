import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../features/auth/context/AuthContext";
import { Building2, Bell, Zap, TrendingUp, Search, Activity, ChevronLeft, Menu, X } from "lucide-react";
import { useState } from "react";

const B2B_MODULES = [
    { id: 'overview', label: 'Executive Overview', icon: Activity, path: '/b2b/overview' },
    { id: 'alerts', label: 'Early Warnings', icon: Bell, path: '/b2b/alerts' },
    { id: 'benchmark', label: 'Market Benchmark', icon: TrendingUp, path: '/b2b/benchmark' },
    { id: 'deep-dive', label: 'Entity Deep Dive', icon: Search, path: '/b2b/deep-dive' },
];

export default function B2BLayout() {
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const isB2B = role === 'b2b' || role === 'admin';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Guard: Only B2B & Admins allowed
    if (!isB2B) {
        return <Navigate to="/" replace />;
    }

    // Guard: Auto-redirect base /b2b to /b2b/overview
    if (location.pathname === '/b2b' || location.pathname === '/b2b/') {
        return <Navigate to="/b2b/overview" replace />;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                    <span className="text-lg font-black text-white tracking-tight">Intelligence B2B</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`
                ${isMobileMenuOpen ? 'flex' : 'hidden'} 
                md:flex flex-col w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 z-40
                ${isMobileMenuOpen ? 'absolute inset-0 top-[65px]' : 'sticky top-[73px] h-[calc(100vh-73px)]'}
            `}>
                <div className="p-6 hidden md:block">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <Building2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Opina+ B2B</h2>
                    </div>
                    <p className="text-xs font-medium text-slate-500">Commercial Intelligence Suite</p>
                </div>

                <nav className="flex-1 py-4 md:py-0 px-4 space-y-1 overflow-y-auto">
                    <div className="px-3 mb-4 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Módulos</span>
                    </div>

                    {B2B_MODULES.map((module) => {
                        const Icon = module.icon;
                        return (
                            <NavLink
                                key={module.id}
                                to={module.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                    ${isActive 
                                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-inner' 
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${location.pathname.includes(module.path) ? 'text-indigo-400' : 'opacity-70'}`} />
                                {module.label}
                            </NavLink>
                        );
                    })}

                    <div className="px-3 mb-4 mt-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sistema</span>
                    </div>

                    <NavLink
                        to="/experience"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200"
                    >
                        <ChevronLeft className="w-4 h-4 opacity-70" />
                        Volver al inicio
                    </NavLink>
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <Zap className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Live Data Feed</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Conectado
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col w-full overflow-hidden ${isMobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
