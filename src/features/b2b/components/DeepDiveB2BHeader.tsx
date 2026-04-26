import { ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { GradientText } from "../../../components/ui/foundation";

interface DeepDiveB2BHeaderProps {
    /** Cuando true, oculta el subtítulo descriptivo — útil para el estado `insufficient_data`. */
    compact?: boolean;
}

export function DeepDiveB2BHeader({ compact = false }: DeepDiveB2BHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <ArrowLeftRight className="w-8 h-8 text-brand" />
                    <GradientText>Comparativa Estratégica</GradientText>
                </h1>
                {!compact && (
                    <p className="text-slate-500 mt-1">
                        Head-to-Head: Análisis de brecha de preferencia y drivers de performance.
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Link
                    to="/b2b"
                    onClick={() => analyticsService.trackSystem('b2b_clicked_next_view', 'info', { destination_view: 'overview' })}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                >
                    Volver al Overview
                </Link>
            </div>
        </div>
    );
}
