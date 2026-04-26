import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ModuleErrorBoundary } from "../../../components/ui/ModuleErrorBoundary";

export interface AdminTab {
    label: string;
    path: string;
    icon: string;
}

interface AdminSectionLayoutProps {
    title: string;
    description: string;
    tabs: AdminTab[];
}

export default function AdminSectionLayout({ title, description, tabs }: AdminSectionLayoutProps) {
    const location = useLocation();

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50 pt-6">
            <div className="w-full px-4 sm:px-8 xl:px-12 mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{description}</p>
                </div>

                {/* Tabs Section */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6 border-b border-slate-200">
                    {tabs.map((tab) => {
                        // We consider it active if the current pathname starts with the tab path (or matches exactly)
                        const isActive = location.pathname.includes(tab.path);

                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={({ isActive }) => `
                                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95
                                    ${isActive 
                                        ? 'text-brand bg-brand-50/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'}
                                `}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-brand' : 'opacity-70'}`}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                                
                                {isActive && (
                                    <motion.div
                                        layoutId={`admin-tab-indicator-${title}`}
                                        className="absolute bottom-[-9px] left-2 right-2 h-[3px] rounded-t-full bg-brand"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Content Section (Child Routes) */}
                <div className="w-full pb-20">
                    <ModuleErrorBoundary moduleName={title}>
                        <Outlet />
                    </ModuleErrorBoundary>
                </div>
            </div>
        </div>
    );
}
