import { useLoyalty } from '../hooks/useLoyalty';
import { Wallet as WalletIcon, Lock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export function WalletView() {
  const { wallet, stats, isLoading } = useLoyalty();
  const { profile } = useAuth();
  
  // Condición de Billetera (Gate)
  const demographics = profile?.demographics;
  const isProfileComplete = demographics && demographics.birthYear && demographics.gender && demographics.region;

  if (isLoading) {
    return <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 animate-pulse h-40"></div>;
  }

  // 1. Mostrar estado bloqueado si falta completar perfil
  if (!isProfileComplete) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6 relative">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-slate-800 p-3 rounded-full mb-3">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Billetera Bloqueada</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Para acceder a tu Billetera Opina+ y comenzar a ganar dinero real, necesitas completar tu perfil demográfico al 100%.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Completar Perfil
          </button>
        </div>

        {/* Blocked state background overlay (blurred) */}
        <div className="opacity-30 blur-[2px]">
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Billetera Opina+</h3>
          </div>
          <div className="text-4xl font-bold text-white">$-- <span className="text-sm font-normal text-slate-400">CLP</span></div>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const isPenaltyActive = (stats?.penalty_months_remaining || 0) > 0;
  const consecutiveWeeks = stats?.consecutive_months_completed || 0; // Guardamos semanas consecutivas acá

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-green-900/30 p-2 rounded-lg border border-green-800/50">
              <WalletIcon className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Billetera Opina+</h3>
          </div>
          <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-2">
            Ver historial
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-1">Saldo Disponible</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">
              ${Number(balance).toLocaleString('es-CL')}
            </span>
            <span className="text-slate-500 mb-1 font-medium">CLP</span>
          </div>
        </div>

        {/* Estado del Pozo vs Próximo Premio */}
        {isPenaltyActive ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
             <div className="flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
               <div>
                  <h4 className="text-sm font-bold text-red-400">En período de recuperación</h4>
                  <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                    Tus recompensas están pausadas. Para volver a recibir premios de $5.000, 
                    debes mantener una racha perfecta completando todas tus misiones durante 
                    <strong className="text-red-400 ml-1">{stats?.penalty_months_remaining} mes(es)</strong> más.
                  </p>
               </div>
             </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-blue-400" />
                 Próximo pago: $5.000
               </h4>
               <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                 Semana {consecutiveWeeks} de 4
               </span>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
               <div 
                 className={`h-2 rounded-full transition-all duration-1000 ${consecutiveWeeks === 4 ? 'bg-green-500' : 'bg-blue-500'}`}
                 style={{ width: `${(consecutiveWeeks / 4) * 100}%` }}
               ></div>
            </div>
            
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
               <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
               Completa tus 4 misiones de la semana para sumar una racha.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-800/30 p-4 border-t border-slate-800 flex justify-end">
        <button 
          disabled={balance < 5000}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
            balance >= 5000 
              ? 'bg-white text-slate-900 hover:bg-slate-100' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          Canjear Saldo
        </button>
      </div>
    </div>
  );
}
