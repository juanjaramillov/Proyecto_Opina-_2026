import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { analyticsService } from "../../../features/analytics/services/analyticsService";

interface ReportsB2BHeaderProps {
    /** Cuando true, oculta el botón "Exportar PDF" — útil para el estado insufficient_data. */
    hideExport?: boolean;
}

export function ReportsB2BHeader({ hideExport = false }: ReportsB2BHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
            <Link
                to="/b2b"
                onClick={() => analyticsService.trackSystem('b2b_clicked_next_view', 'info', { destination_view: 'overview' })}
                className="text-slate-500 hover:text-brand-600 transition flex items-center gap-2 font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver
            </Link>

            {!hideExport && (
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-brand to-accent hover:opacity-90 hover:scale-105 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20">
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </button>
            )}
        </div>
    );
}
