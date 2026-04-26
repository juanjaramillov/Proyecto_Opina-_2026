import { TrendingDown, TrendingUp, Zap, Sparkles } from "lucide-react";
import type { ExecutiveFinding } from "../utils/executiveSummaryHelpers";

function renderIcon(iconName: string) {
    switch (iconName) {
        case "trending-up":
            return <TrendingUp className="w-5 h-5 text-accent" />;
        case "trending-down":
            return <TrendingDown className="w-5 h-5 text-danger-600" />;
        case "zap":
            return <Zap className="w-5 h-5 text-warning-500" />;
        default:
            return <Sparkles className="w-5 h-5 text-brand-500" />;
    }
}

interface OverviewB2BKeyFindingsProps {
    findings: ExecutiveFinding[];
}

/**
 * Three-up grid of "key findings" cards (leader, momentum, risk).
 */
export function OverviewB2BKeyFindings({ findings }: OverviewB2BKeyFindingsProps) {
    return (
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {findings.map((finding, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full hover:border-brand-100 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-2xl ${
                            finding.trend === 'positive' ? 'bg-accent/10' :
                            finding.trend === 'negative' ? 'bg-danger-50' : 'bg-warning-50'
                        }`}>
                            {renderIcon(finding.icon)}
                        </div>
                        <h4 className="font-bold text-slate-900">{finding.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">
                        {finding.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
