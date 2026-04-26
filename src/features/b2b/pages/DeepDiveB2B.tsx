import { useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";
import { computeDeepDivePair } from "../utils/deepDiveHelpers";
import { DeepDiveB2BHeader } from "../components/DeepDiveB2BHeader";
import { DeepDiveB2BContestantCard } from "../components/DeepDiveB2BContestantCard";
import { DeepDiveB2BInsightPanel } from "../components/DeepDiveB2BInsightPanel";

/**
 * Comparativa Estratégica · Composer B2B
 *
 * Partición DEBT-004: esta página sólo decide cuál de los 3 estados renderizar
 * (loading / insufficient_data / happy) y compone los sub-componentes. La lógica
 * de "quién es líder y retador" vive en `computeDeepDivePair`.
 */
export default function DeepDiveB2B() {
    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_deep_dive', 'info');
    }, []);

    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const { loading, snapshot } = useOverviewB2BState();

    if (loading) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <ArrowLeftRight className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Cargando Análisis Comparativo...</div>
                </div>
            </div>
        );
    }

    const pair = computeDeepDivePair(snapshot);
    const total = snapshot?.overview.secondaryMetrics["Total Señales Evaluadas"] || 0;

    if (!pair) {
        return (
            <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
                <DeepDiveB2BHeader compact />
                <div className="max-w-3xl mx-auto w-full mt-10">
                    <MetricAvailabilityCard
                        label="Comparativa Estratégica (Head-to-Head)"
                        status="insufficient_data"
                        helperText={`Se requieren múltiples competidores fuertes con datos sólidos para desbloquear el análisis profundo (Interacciones Mínimas: 30, Actuales: ${total}).`}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-screen bg-[#F8FAFC]">
            <DeepDiveB2BHeader />

            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DeepDiveB2BContestantCard contestant={pair.leader} variant="leader" />
                    <DeepDiveB2BContestantCard contestant={pair.challenger} variant="challenger" />
                </div>

                <DeepDiveB2BInsightPanel pair={pair} isAdmin={isAdmin} />
            </div>
        </div>
    );
}
