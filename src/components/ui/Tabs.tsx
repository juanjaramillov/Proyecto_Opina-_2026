import React from 'react';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`flex items-center gap-1 border-b border-stroke overflow-x-auto no-scrollbar ${className}`}>
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors
                            ${isActive ? 'text-primary' : 'text-text-muted hover:text-ink hover:bg-surface2 rounded-t-lg'}
                        `}
                    >
                        {tab.icon && <span className="flex items-center">{tab.icon}</span>}
                        {tab.label}

                        {isActive && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
