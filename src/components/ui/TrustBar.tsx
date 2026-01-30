import React from 'react';

const TrustBar: React.FC = () => {
    return (
        <div className="w-full max-w-sm mx-auto mt-6 mb-2">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-2 text-indigo-600">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-black uppercase tracking-wider">Opiniones reales</span>
                </div>

                <div className="flex flex-wrap justify-center gap-y-1 gap-x-3 text-[10px] font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">money_off</span>
                        <span>Sin marcas, sin pagos</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">group</span>
                        <span>Señal basada en personas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                        <span>Privacidad protegida</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustBar;
