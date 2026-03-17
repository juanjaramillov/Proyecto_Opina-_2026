import { useEffect } from "react";
import { Building2, AlertTriangle } from "lucide-react";
import { trackEvent } from "../../../services/analytics/trackEvent";

import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { OverviewB2BHeader } from "../components/OverviewB2BHeader";
import { OverviewB2BEntityList } from "../components/OverviewB2BEntityList";
import { OverviewB2BAlertsPanel } from "../components/OverviewB2BAlertsPanel";
import { OverviewB2BDeepDive } from "../components/OverviewB2BDeepDive";
import { OverviewB2BExecutiveSummary } from "../components/OverviewB2BExecutiveSummary";

export default function OverviewB2B() {
    const {
        isB2B,
        loading,
        snapshot,
        alerts,
        searchTerm,
        setSearchTerm,
        filteredRankings,
        leaderboard,
        selectedEntity,
        setSelectedEntity,
        entityNarrative,
        loadingDetails,
        handleSelectEntity,
        loadData
    } = useOverviewB2BState();

    useEffect(() => {
        trackEvent('b2b_opened_overview');
    }, []);

    if (!isB2B) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
                    <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
                    <p className="text-slate-500">No tienes permisos de analista corporativo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
            <OverviewB2BHeader onRefresh={loadData} />

            {snapshot?.sufficiency === 'insufficient_data' && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-900">Datos Insuficientes</h4>
                        <p className="text-sm text-amber-700">Aún no hay suficiente actividad (menos de 50 señales) en la plataforma para reflejar tendencias válidas globales. Las métricas mostradas tienen alcance exploratorio únicamente.</p>
                    </div>
                </div>
            )}

            <OverviewB2BExecutiveSummary />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Radar de Anomalías</h3>
                    <OverviewB2BEntityList 
                        loading={loading}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredRankings={filteredRankings}
                        totalRankings={leaderboard.length}
                        selectedEntity={selectedEntity}
                        onSelectEntity={handleSelectEntity}
                    />
                </div>
                
                <div>
                     <OverviewB2BAlertsPanel alerts={alerts} />
                </div>
            </div>

            <OverviewB2BDeepDive 
                selectedEntity={selectedEntity}
                entityNarrative={entityNarrative}
                loadingDetails={loadingDetails}
                onClose={() => setSelectedEntity(null)}
            />
        </div>
    );
}
