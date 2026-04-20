
import VersusView from "../VersusView";
import TorneoView from "../TorneoView";
import ProfundidadView from "../ProfundidadView";
import LugaresView from "../LugaresView";
import ServiciosView from "../ServiciosView";
import { ActualidadHubManager } from "../ActualidadHubManager";
import { ModuleErrorBoundary } from "../../../../components/ui/ModuleErrorBoundary";
import { Battle } from "../../../signals/types";

export interface SignalsRouterProps {
    mode: string;
    resetToMenu: () => void;
    battles: Battle[];
    batchIndex: number;
    handleBatchComplete: (history: Array<{ battle: Battle; mySignal: 'A' | 'B'; pctA: number }>) => void;
}

export default function SignalsRouter({
    mode,
    resetToMenu,
    battles,
    batchIndex,
    handleBatchComplete
}: SignalsRouterProps) {
    // 1. Vistas Inmersivas (Full Bleed)
    if (mode === "versus") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Versus (Especializado)">
                    <VersusView
                        battles={battles}
                        batchIndex={batchIndex}
                        onBatchComplete={handleBatchComplete}
                        onBack={resetToMenu}
                    />
                </ModuleErrorBoundary>
            </div>
        );
    }

    if (mode === "torneo") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Torneo">
                    <TorneoView battles={battles} onBack={resetToMenu} />
                </ModuleErrorBoundary>
            </div>
        );
    }

    if (mode === "profundidad") {
        return (
            <div className="w-full relative min-h-screen bg-white">
                <ModuleErrorBoundary moduleName="Profundidad">
                    <ProfundidadView battles={battles} onClose={resetToMenu} />
                </ModuleErrorBoundary>
            </div>
        );
    }

    // 2. Vistas de Contenedor (Fallback para módulos Boxed)
    return (
        <div className="w-full relative min-h-screen bg-white pb-24">
            <div className="container-ws pt-4 md:pt-8 space-y-6">
                {mode === "actualidad" && (
                    <ModuleErrorBoundary moduleName="Actualidad">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[600px] relative overflow-hidden">
                                <ActualidadHubManager onClose={resetToMenu} />
                            </div>
                        </div>
                    </ModuleErrorBoundary>
                )}

                {mode === "lugares" && (
                    <ModuleErrorBoundary moduleName="Lugares">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
                            <div className="sticky top-4 z-[100] w-full flex justify-start mb-2 px-4 md:px-0">
                                <button
                                    onClick={resetToMenu}
                                    className="h-10 px-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Volver al Hub
                                </button>
                            </div>
                            <LugaresView onClose={resetToMenu} battles={battles} />
                        </div>
                    </ModuleErrorBoundary>
                )}

                {mode === "servicios" && (
                    <ModuleErrorBoundary moduleName="Servicios">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
                            <div className="sticky top-4 z-[100] w-full flex justify-start mb-2 px-4 md:px-0">
                                <button
                                    onClick={resetToMenu}
                                    className="h-10 px-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Volver al Hub
                                </button>
                            </div>
                            <ServiciosView onClose={resetToMenu} battles={battles} />
                        </div>
                    </ModuleErrorBoundary>
                )}
            </div>
        </div>
    );
}
