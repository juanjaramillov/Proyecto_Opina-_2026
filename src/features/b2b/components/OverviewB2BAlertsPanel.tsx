import { Bell } from "lucide-react";
import { IntelligenceAlert } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

interface OverviewB2BAlertsPanelProps {
  alerts: IntelligenceAlert[];
}

export function OverviewB2BAlertsPanel({ alerts }: OverviewB2BAlertsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" />
          Alertas de Mercado
          {alerts.length > 0 && (
            <span className="bg-brand-100 text-brand-600 text-[10px] px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </h3>

        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-brand-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-danger-500 animate-pulse' :
                    alert.severity === 'medium' ? 'bg-warning-500' : 'bg-brand-500'
                  }`} />
                  <p className="text-xs font-bold text-slate-900">{alert.category}</p>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {alert.headline}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Origen: {(alert.metricId) || 'Sistema'}</span>
                  <span>Hace {Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} min</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[11px] font-bold text-slate-400">Mercado estable, sin alertas relevantes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
