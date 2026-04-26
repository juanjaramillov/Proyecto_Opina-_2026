import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";
import { ReportsB2BHeader } from "../components/ReportsB2BHeader";
import { ReportsB2BDocument } from "../components/ReportsB2BDocument";
import { buildReportContent, isReportAvailable, type ReportContent } from "../utils/reportsHelpers";
import { logger } from "../../../lib/logger";

/**
 * Reports B2B · Composer
 *
 * Partición DEBT-004: esta página decide el estado (loading / insufficient /
 * available), renderiza el header, y delega el documento al
 * `ReportsB2BDocument`. El contenido narrativo se resuelve en
 * `buildReportContent` → `narrativeEngine.generateMarketNarrative`:
 * clasificación determinística sobre el snapshot (NO modelo generativo),
 * reproducible para los mismos números, auditablemente trazable.
 *
 * Desde Fase 4.4 se retiró el `BetaDisclaimerBanner` del tope: el motor
 * narrativo ya no es un placeholder por plantilla ad-hoc, es un clasificador
 * documentado en `narrativeEngine.ts` + `narrativeEngine.test.ts`.
 */
export default function ReportsB2B() {
    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_reports', 'info');
    }, []);

    const { loading, snapshot } = useOverviewB2BState();
    const [content, setContent] = useState<ReportContent | null>(null);

    // Fase 5.1: buildReportContent es async para soportar providers con
    // latencia (LLM). El provider default rule-based resuelve inmediatamente,
    // así que el "loading" adicional es imperceptible hoy.
    useEffect(() => {
        let cancelled = false;
        if (!snapshot || !isReportAvailable(snapshot)) {
            setContent(null);
            return;
        }
        buildReportContent(snapshot)
            .then((result) => { if (!cancelled) setContent(result); })
            .catch((err) => {
                logger.error("[ReportsB2B] Error building report content:", err);
                if (!cancelled) setContent(null);
            });
        return () => { cancelled = true; };
    }, [snapshot]);

    if (loading) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Generando Reporte de Inteligencia...</div>
                </div>
            </div>
        );
    }

    if (!snapshot || !isReportAvailable(snapshot)) {
        const total = snapshot?.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
                <ReportsB2BHeader hideExport />
                <div className="max-w-3xl mx-auto w-full mt-10">
                    <MetricAvailabilityCard
                        label="Reporte de Inteligencia B2B"
                        status="insufficient_data"
                        helperText={`Se requiere mayor actividad global para desbloquear la generación de reportes B2B. (Interacciones Mínimas: 30, Actual: ${total})`}
                    />
                </div>
            </div>
        );
    }

    if (!content) {
        // Provider resolviendo (relevante cuando se conecte un LLM con latencia).
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Generando Brief Ejecutivo...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
            <ReportsB2BHeader />
            <ReportsB2BDocument content={content} />
        </div>
    );
}
