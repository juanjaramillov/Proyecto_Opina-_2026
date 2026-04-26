import { AlertTriangle, Sparkles } from "lucide-react";
import type { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

type SnapshotAlert = IntelligenceAnalyticsSnapshot['alerts'][number];

interface OverviewB2BSignalsRailProps {
    alerts: SnapshotAlert[];
}

/**
 * Vertical rail of up to 3 high-severity signals shown next to the key findings.
 */
export function OverviewB2BSignalsRail({ alerts }: OverviewB2BSignalsRailProps) {
    return (
        <div className="lg:col-span-1 space-y-4">
            {alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className={`p-5 rounded-3xl border shadow-sm ${
                    alert.severity === 'high'
                        ? 'bg-danger-50 border-danger-100'
                        : 'bg-accent/10 border-accent-100'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {alert.severity === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-danger-600" />
                        ) : (
                            <Sparkles className="w-5 h-5 text-accent" />
                        )}
                        <h4 className={`font-bold text-sm ${
                            alert.severity === 'high' ? 'text-danger-900' : 'text-accent-900'
                        }`}>{alert.headline}</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                        alert.severity === 'high' ? 'text-danger-700' : 'text-accent'
                    }`}>
                        {alert.message}
                    </p>
                </div>
            ))}
        </div>
    );
}
