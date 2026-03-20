import { motion, AnimatePresence } from "framer-motion";

export type Subcategory = {
    id: string;
    label: string;
    slug: string;
    icon?: string; // Material Symbol name
};

export type ParentIndustry = {
    id: string;
    title: string;
    subtitle: string;
    theme: {
        primary: string;
        accent: string;
        bgGradient: string;
        icon: string;
    };
    subcategories: Subcategory[];
};

export type ParentIndustriesMap = Record<string, ParentIndustry>;

interface IndustrySelectorProps {
    industries: ParentIndustriesMap;
    selectedParentId: string | null;
    selectedSubcategoryId: string | null;
    onParentChange: (parentId: string | null) => void;
    onSubcategoryChange: (subcategoryId: string | null) => void;
    title?: string;
    subtitle?: string;
    hideMixOption?: boolean;
}

export function IndustrySelector({
    industries,
    selectedParentId,
    selectedSubcategoryId,
    onParentChange,
    onSubcategoryChange,
    title = "Filtrar por industria",
    subtitle = "Puedes cambiar de categoría en cualquier momento.",
    hideMixOption = false,
}: IndustrySelectorProps) {

    const vContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const vItem = {
        hidden: { opacity: 0, y: 15, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
    };

    const selectedParent = selectedParentId ? industries[selectedParentId] : null;

    // View 1: Grid of Parent Categories
    if (!selectedParent) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-ink">{title}</h2>
                        {subtitle && <p className="text-xs md:text-sm text-muted font-medium mt-1">{subtitle}</p>}
                    </div>
                </div>

                <motion.div
                    variants={vContainer}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3"
                >
                    {/* "Mix" Option (if not hidden) */}
                    {!hideMixOption && (
                        <motion.button
                            layoutId="parent-mix"
                            variants={vItem}
                            onClick={() => {
                                onParentChange('mix');
                                onSubcategoryChange(null);
                            }}
                            className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 text-center flex flex-col items-center gap-2 group relative overflow-hidden ${selectedParentId === 'mix'
                                ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20'
                                : 'border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1'
                                }`}
                            style={{ '--hover-color': '#2563eb' } as React.CSSProperties}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${selectedParentId === 'mix'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-50 text-slate-600 group-hover:text-white'
                                }`}>
                                {selectedParentId !== 'mix' && (
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10 bg-primary-600" />
                                )}
                                <span className="material-symbols-outlined text-xl relative z-10">hub</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-tight text-ink line-clamp-1 transition-colors duration-300 group-hover:text-slate-900">Mix</div>
                        </motion.button>
                    )}

                    {/* Parent Industry Grid */}
                    {Object.entries(industries).map(([key, t]) => {
                        const isActive = selectedParentId === key;
                        return (
                            <motion.button
                                layoutId={`parent-${key}`}
                                variants={vItem}
                                key={t.id}
                                onClick={() => {
                                    onParentChange(key);
                                    onSubcategoryChange(null);
                                }}
                                className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 text-center flex flex-col items-center gap-2 group relative overflow-visible ${isActive
                                    ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20'
                                    : 'border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1'
                                    }`}
                                style={{ '--hover-color': t.theme.primary } as React.CSSProperties}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${isActive
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-50 text-slate-600 group-hover:text-white'
                                    }`}>
                                    {!isActive && (
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--hover-color)] opacity-0 group-hover:opacity-40 rounded-2xl transition-opacity duration-300 -z-10" style={{ borderColor: t.theme.primary }} />
                                    )}
                                    {!isActive && (
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10" style={{ backgroundColor: t.theme.primary }} />
                                    )}
                                    <span className="material-symbols-outlined text-xl relative z-10">{t.theme.icon}</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-ink leading-[1.1] transition-colors duration-300 group-hover:text-slate-900 break-words w-full h-full flex items-center justify-center">{t.title}</div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>
        );
    }

    // View 2: Split View (Quadrant Left, Subcategories Right)
    return (
        <div className="flex flex-col md:flex-row gap-6 relative min-h-[300px]">
            {/* Left Quadrant (Parent Focus) */}
            <motion.div
                layoutId={`parent-${selectedParentId}`}
                className="w-full md:w-1/3 xl:w-1/4 rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden relative flex flex-col isolate shrink-0"
                style={{ backgroundColor: 'white' }}
            >
                {/* Visual Background Accent using theme color */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none -z-10"
                    style={{ backgroundColor: selectedParent.theme.primary }}
                />

                {/* Back Button */}
                <button
                    onClick={() => {
                        onParentChange(null);
                        onSubcategoryChange(null);
                    }}
                    className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95"
                    title="Volver a todas las categorías"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>

                <div className="p-8 flex flex-col items-center justify-center text-center flex-1 mt-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
                        style={{ backgroundColor: selectedParent.theme.primary }}
                    >
                        <span className="material-symbols-outlined text-4xl">{selectedParent.theme.icon}</span>
                    </motion.div>

                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                        {selectedParent.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 leading-snug">
                        {selectedParent.subtitle}
                    </p>
                </div>
            </motion.div>

            {/* Right Side: Subcategories */}
            <div className="flex-1 rounded-[2rem] border border-slate-100 shadow-sm bg-slate-50/50 p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-black text-slate-800">Elige la subcategoría</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {selectedParent.subcategories.length} opciones
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedParentId}
                        variants={vContainer}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 origin-left"
                    >
                        {/* Removed 'All' subcategory selector as requested */}

                        {selectedParent.subcategories.map((sub) => {
                            const isSelected = selectedSubcategoryId === sub.id;
                            return (
                                <motion.button
                                    key={sub.id}
                                    variants={vItem}
                                    onClick={() => onSubcategoryChange(sub.id)}
                                    className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 flex items-center gap-3 group relative overflow-hidden ${isSelected
                                        ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20'
                                        : 'border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isSelected
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-slate-50 text-slate-600 group-hover:bg-primary-500 group-hover:text-white'
                                        }`}>
                                        <span className="material-symbols-outlined text-lg">
                                            {sub.icon || 'label'}
                                        </span>
                                    </div>
                                    <div className="font-bold text-sm tracking-tight flex-1 text-left line-clamp-2 leading-tight">
                                        {sub.label}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
