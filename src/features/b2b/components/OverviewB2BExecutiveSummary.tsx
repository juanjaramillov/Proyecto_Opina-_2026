import { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import { buildExecutiveSummaryText, buildDynamicFindings } from "../utils/executiveSummaryHelpers";
import { OverviewB2BExecutiveNarrative } from "./OverviewB2BExecutiveNarrative";
import { OverviewB2BKeyFindings } from "./OverviewB2BKeyFindings";
import { OverviewB2BSignalsRail } from "./OverviewB2BSignalsRail";

/**
 * Composer for the B2B executive summary block.
 * Keeps presentation-only, delegates data shaping to `executiveSummaryHelpers`
 * and rendering to three specialised children.
 */
export function OverviewB2BExecutiveSummary({ snapshot }: { snapshot: IntelligenceAnalyticsSnapshot }) {
    const summaryText = buildExecutiveSummaryText(snapshot);
    const findings = buildDynamicFindings(snapshot);

    return (
        <div className="mb-10 space-y-8">
            <OverviewB2BExecutiveNarrative summaryText={summaryText} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <OverviewB2BKeyFindings findings={findings} />
                <OverviewB2BSignalsRail alerts={snapshot.alerts} />
            </div>
        </div>
    );
}
