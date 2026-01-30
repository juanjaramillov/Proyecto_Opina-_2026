import { AccountProfile } from '../../../auth/account';
import { useSignalStore } from '../../../store/signalStore';

interface SignalMeterProps {
    profile: AccountProfile | null;
}

export default function SignalMeter({ profile }: SignalMeterProps) {
    const { signalsToday } = useSignalStore();

    const dailyLimit = profile?.signalsDailyLimit ?? 10;
    const isUnlimitedSignals = dailyLimit === -1;

    const remaining = isUnlimitedSignals ? 999 : Math.max(0, dailyLimit - signalsToday);
    const lockedByLimit = !isUnlimitedSignals && remaining <= 0;

    const signalsLeftToday = isUnlimitedSignals ? Infinity : remaining;
    const maxSignalsPerDay = isUnlimitedSignals ? Infinity : dailyLimit;

    return (
        <section className="w-full flex justify-center px-4 pb-0 mb-4" aria-live="polite">
            <div className="w-full max-w-4xl border border-slate-900/10 bg-white/75 rounded-[22px] p-[14px] shadow-[0_10px_30px_rgba(2,6,23,0.05)] backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-2.5">
                    <div className="text-[11px] font-black tracking-widest uppercase text-slate-500/80">
                        Señales de hoy
                    </div>
                    <div className="text-[13px] font-bold text-slate-900 text-left sm:text-right">
                        {isUnlimitedSignals ? (
                            <span className="text-emerald-600">¡Señales ilimitadas activas!</span>
                        ) : (
                            <>Te quedan <strong>{signalsLeftToday}</strong> de <strong>{maxSignalsPerDay}</strong></>
                        )}
                    </div>
                </div>

                {!isUnlimitedSignals && (
                    <div className="w-full h-2.5 rounded-full bg-slate-900/10 overflow-hidden mb-2.5">
                        <div
                            className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
                            style={{ width: `${Math.round(((maxSignalsPerDay - signalsLeftToday) / maxSignalsPerDay) * 100)}%` }}
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-slate-500/90 leading-snug">
                        {isUnlimitedSignals
                            ? "Tienes acceso total y sin límites gracias a tu verificación CI."
                            : `${profile?.tier === 'verified_basic' ? 'Verified Basic' : 'Invitado'}: ${maxSignalsPerDay} señales diarias.`
                        }
                    </div>
                    {!isUnlimitedSignals && (
                        <a className="inline-flex items-center justify-center px-3 py-2 rounded-[14px] font-black text-xs bg-slate-900 text-white hover:opacity-90 no-underline whitespace-nowrap transition-opacity w-full sm:w-auto" href="/verificacion">
                            Verificar identidad con CI
                        </a>
                    )}
                </div>

                {lockedByLimit && (
                    <div className="mt-3 pt-3 border-t border-amber-500/25 animate-in fade-in slide-in-from-top-2">
                        <div className="font-extrabold text-[13px] text-amber-800 mb-1">Límite diario alcanzado</div>
                        <div className="text-xs text-amber-700/90 leading-snug">
                            Verifica con tu CI para señales ilimitadas, o vuelve mañana.
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
