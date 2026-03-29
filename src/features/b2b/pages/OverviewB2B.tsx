import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";
import { OverviewB2BHeader } from "../components/OverviewB2BHeader";
import { OverviewB2BEntityList } from "../components/OverviewB2BEntityList";
import { OverviewB2BAlertsPanel } from "../components/OverviewB2BAlertsPanel";
import { OverviewB2BDeepDive } from "../components/OverviewB2BDeepDive";
import { OverviewB2BExecutiveSummary } from "../components/OverviewB2BExecutiveSummary";
import { MetricAvailabilityCard } from "../../../components/ui/MetricAvailabilityCard";

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
        loadingDetails,
        handleSelectEntity,
        loadData
    } = useOverviewB2BState();

    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_overview', 'info');
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

            {snapshot && snapshot.availability !== 'healthy' && (
                <div className="mb-8">
                    <MetricAvailabilityCard 
                        label="Radar Global"
                        status={snapshot.availability === 'insufficient_data' ? 'insufficient_data' : 'pending'} 
                        helperText="Aún no hay suficiente actividad de batallas en la plataforma para reflejar tendencias válidas globales."
                    />
                </div>
            )}

            {snapshot && <OverviewB2BExecutiveSummary snapshot={snapshot} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Ranking Competitivo</h3>
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
                loadingDetails={loadingDetails}
                onClose={() => setSelectedEntity(null)}
            />
        </div>
    );
}
