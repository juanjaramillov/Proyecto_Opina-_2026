import React from 'react';

export const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-slate-400 font-bold text-sm animate-pulse">
                    Cargando Opina+...
                </div>
            </div>
        </div>
    );
};

export default Loading;
