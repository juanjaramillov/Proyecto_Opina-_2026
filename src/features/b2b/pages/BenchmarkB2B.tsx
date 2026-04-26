import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useBenchmarkB2BState } from "../hooks/useBenchmarkB2BState";
import { BenchmarkB2BHeader } from "../components/BenchmarkB2BHeader";
import { BenchmarkB2BRankingTable } from "../components/BenchmarkB2BRankingTable";
import { BenchmarkB2BDeepDivePanel } from "../components/BenchmarkB2BDeepDivePanel";

/**
 * Market Benchmark · Composer B2B
 *
 * Partición DEBT-004: esta página solo orquesta. Todo el estado vive en
 * `useBenchmarkB2BState`, y la UI está cortada en Header / RankingTable /
 * DeepDivePanel. Mantener esta página por debajo de ~70 líneas.
 */
export default function BenchmarkB2B() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const {
        loading,
        leaderboard,
        filteredRankings,
        searchTerm,
        setSearchTerm,
        selectedEntity,
        setSelectedEntity,
        entityNarrative,
        loadingDetails,
        loadData,
        handleSelectEntity
    } = useBenchmarkB2BState();

    return (
        <div className="p-6 lg:p-10">
            <BenchmarkB2BHeader onRefresh={loadData} />

            <BenchmarkB2BRankingTable
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredRankings={filteredRankings}
                totalRankings={leaderboard.length}
                selectedEntity={selectedEntity}
                onSelectEntity={handleSelectEntity}
            />

            {selectedEntity && (
                <BenchmarkB2BDeepDivePanel
                    selectedEntity={selectedEntity}
                    entityNarrative={entityNarrative}
                    loadingDetails={loadingDetails}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedEntity(null)}
                />
            )}
        </div>
    );
}
