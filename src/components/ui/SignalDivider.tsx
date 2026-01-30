
import React from 'react';

const SignalDivider: React.FC = () => {
    return (
        <div className="flex items-center justify-center py-8 opacity-40">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mx-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>
    );
};

export default SignalDivider;
