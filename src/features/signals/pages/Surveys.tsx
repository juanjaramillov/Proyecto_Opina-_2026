import { useNavigate } from 'react-router-dom';
import { useEntitlements } from '../../../hooks/useEntitlements';
import RequireEntitlement from '../../auth/components/RequireEntitlement';
import { useAccountProfile } from "../../../auth/useAccountProfile";

export default function Surveys() {
  const navigate = useNavigate();
  const ent = useEntitlements();

  // Compat: si todavía no existe isUnlimitedSignals en tu entitlements, cae a isVerified
  const isUnlimitedSignals = ent.isUnlimitedSignals ?? ent.isVerified ?? false;

  const hasSignals = isUnlimitedSignals || ent.signalsLeftToday > 0;

  const goVerify = () => navigate('/verificacion');

  const handleAnswer = (_answerId: string) => {
    if (!hasSignals) {
      goVerify();
      return;
    }

    // Logic to submit signal would go here
    console.log('Answer selected:', _answerId);

  };

  const { profile, loading } = useAccountProfile();

  if (loading || !profile) return null;

  return (
    <RequireEntitlement
      tier={profile.tier}
      profileCompleteness={profile.profileCompleteness}
      hasCI={profile.hasCI}
      require="insights"
    >
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Insights</h1>


        {!hasSignals && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <strong>Límite diario alcanzado.</strong>
            <p className="mt-1 text-sm text-amber-800">
              Verifica con tu CI para señales ilimitadas, o vuelve mañana.
            </p>
            <button
              onClick={goVerify}
              className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-white hover:opacity-90"
            >
              Verificar identidad con CI
            </button>
          </div>
        )}

        <div className="space-y-3">
          <button
            disabled={!hasSignals}
            onClick={() => handleAnswer('a')}
            className={`w-full rounded-2xl p-4 text-left font-semibold ${hasSignals
              ? 'bg-white hover:bg-gray-100'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
          >
            Opción A
          </button>

          <button
            disabled={!hasSignals}
            onClick={() => handleAnswer('b')}
            className={`w-full rounded-2xl p-4 text-left font-semibold ${hasSignals
              ? 'bg-white hover:bg-gray-100'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
          >
            Opción B
          </button>
        </div>
      </div>
    </RequireEntitlement>
  );
}
