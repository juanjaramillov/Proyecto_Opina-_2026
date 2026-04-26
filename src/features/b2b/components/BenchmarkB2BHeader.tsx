import { TrendingUp, Activity } from "lucide-react";
import { GradientText } from "../../../components/ui/foundation";

interface BenchmarkB2BHeaderProps {
    onRefresh: () => void;
}

export function BenchmarkB2BHeader({ onRefresh }: BenchmarkB2BHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-brand-600" />
                    <GradientText>Market Benchmark</GradientText>
                </h1>
                <p className="text-slate-500 mt-1">
                    ¿Quién gana la atención del consumidor? Comparativa de retención, volumen y preferencias frente a competidores.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                >
                    <Activity className="w-4 h-4 text-brand-500" />
                    Refrescar
                </button>
            </div>
        </div>
    );
}
