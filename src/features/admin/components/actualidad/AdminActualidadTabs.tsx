import { FileEdit, Activity, CheckCircle, Radio, Archive, Inbox } from "lucide-react";
import { TopicStatus } from "../../../signals/types/actualidad";

interface AdminActualidadTabsProps {
  activeTab: TopicStatus;
  setActiveTab: (tab: TopicStatus) => void;
  loading: boolean;
  totalTopics: number;
}

export function AdminActualidadTabs({ activeTab, setActiveTab, loading, totalTopics }: AdminActualidadTabsProps) {
  const tabs = [
    { id: 'detected', label: 'Bandeja IA', icon: Inbox, desc: 'Detectados' },
    { id: 'draft', label: 'Borradores', icon: FileEdit, desc: 'Edición' },
    { id: 'review', label: 'En Revisión', icon: Activity, desc: 'Validación' },
    { id: 'approved', label: 'Aprobados', icon: CheckCircle, desc: 'Listos' },
    { id: 'published', label: 'Publicados', icon: Radio, desc: 'Visibles App' },
    { id: 'archived', label: 'Archivados', icon: Archive, desc: 'Históricos' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TopicStatus)}
            className={`relative flex flex-col justify-center p-4 rounded-2xl text-left transition-all duration-300 border ${
              active 
                ? 'bg-white border-primary-500 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.3)] ring-1 ring-primary-500 z-10' 
                : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-black text-sm leading-tight truncate ${active ? 'text-primary-900' : 'text-slate-700'}`}>
                  {tab.label}
                </span>
              </div>
              {active && (
                <div className="bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ml-1">
                  {loading ? '...' : totalTopics}
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-500 mt-1 truncate">{tab.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
