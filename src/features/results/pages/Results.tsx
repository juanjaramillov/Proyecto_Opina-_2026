import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client";

type MyRecentVersusSignal = {
  created_at: string;
  battle_id: string;
  battle_title: string | null;
  option_id: string;
  option_label: string | null;
  entity_id: string | null;
  entity_name: string | null;
  image_url: string | null;
  signal_weight: number | null;
};
import { analyticsService } from "../services/analyticsService";
import { profileService } from "../../profile/services/profileService";
import { logger } from "../../../lib/logger";
import { SkeletonRankingRow } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

// --- Chip removible (simple) ---
function FilterChip({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-xs">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        aria-label={`Quitar filtro ${label}`}
      >
        ×
      </button>
    </div>
  );
}

export default function ResultsPage() {
  const nav = useNavigate();

  // filtros
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [ageBucket, setAgeBucket] = useState<string | undefined>(undefined);

  // estados
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // data
  const [results, setResults] = useState<any[]>([]);

  const [mySignals, setMySignals] = useState<MyRecentVersusSignal[]>([]);
  const [mySignalsLoading, setMySignalsLoading] = useState(false);
  const [mySignalsError, setMySignalsError] = useState<string | null>(null);

  async function loadMySignals() {
    try {
      setMySignalsLoading(true);
      setMySignalsError(null);

      const { data, error } = await (supabase as any).rpc("get_my_recent_versus_signals", {
        p_limit: 20,
      });

      if (error) throw error;

      setMySignals((data ?? []) as MyRecentVersusSignal[]);
    } catch (e: any) {
      setMySignalsError("No se pudieron cargar tus señales.");
    } finally {
      setMySignalsLoading(false);
    }
  }

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; remove: () => void }> = [];
    if (gender) chips.push({ key: "gender", label: `Género: ${gender}`, remove: () => setGender(undefined) });
    if (region) chips.push({ key: "region", label: `Región: ${region}`, remove: () => setRegion(undefined) });
    if (ageBucket) chips.push({ key: "age", label: `Edad: ${ageBucket}`, remove: () => setAgeBucket(undefined) });
    return chips;
  }, [gender, region, ageBucket]);

  const clearAll = () => {
    setGender(undefined);
    setRegion(undefined);
    setAgeBucket(undefined);
  };

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      // --- Regla de lock actual (mantén tu lógica real si existe en tu app) ---
      // Si tú ya tienes un "threshold" real (ej: 30 señales), reemplaza este cálculo por tu fuente real.
      // Aquí dejamos el hook con user_stats, porque NO es signal_events (y ya lo tienes).
      await profileService.getUserStats();
      // const totalSignals = stats?.total_signals ?? 0;
      // const isLocked = totalSignals < 30;
      setLocked(false); // Restriction removed by user request

      // Cargar resultados (si está locked igual cargamos, pero se ve difuminado)
      const data = await analyticsService.getAdvancedResults("general", {
        gender,
        region,
        age_bucket: ageBucket
      } as any);

      setResults(data || []);
    } catch (e: any) {
      logger.error(e);
      setErr(e?.message ?? "No se pudieron cargar los resultados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadMySignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, region, ageBucket]);

  // --- UI ---
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Resultados</h1>
            <p className="text-slate-500 font-medium mt-1">
              Filtra y compara señales agregadas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav("/experience")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 hover:opacity-95 text-white font-black transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Ir a participar
          </button>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <FilterChip key={c.key} label={c.label} onRemove={c.remove} />
            ))}

            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-black text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-50 transition"
              >
                Borrar filtros
              </button>
            )}
          </div>

          {/* Controles (mantén tus selects existentes si los tienes; aquí va lo mínimo) */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={gender ?? ""}
              onChange={(e) => setGender(e.target.value || undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="">Género (Todos)</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Otro</option>
            </select>

            <select
              value={region ?? ""}
              onChange={(e) => setRegion(e.target.value || undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="">Región (Todas)</option>
              <option value="Metropolitana">Metropolitana</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Biobío">Biobío</option>
            </select>

            <select
              value={ageBucket ?? ""}
              onChange={(e) => setAgeBucket(e.target.value || undefined)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            >
              <option value="">Edad (Todas)</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mt-8 relative">

          {/* Fondo difuminado cuando está locked */}
          <div className={locked ? "pointer-events-none select-none blur-[2px] opacity-40" : ""}>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Panel 1: Resultados */}
              <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-6">
                <h2 className="text-lg font-black text-slate-900">Ranking agregado</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Ordenado por preferencia.</p>

                {loading ? (
                  <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                    <SkeletonRankingRow />
                  </div>
                ) : err ? (
                  <div className="mt-6 text-rose-600 font-bold">{err}</div>
                ) : results.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      title="Sin datos suficientes"
                      description="No hay información suficiente para los filtros seleccionados. Intenta ampliar tu búsqueda."
                      icon="analytics"
                    />
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {results.slice(0, 10).map((r: any, idx: number) => (
                      <div key={r.entity_id ?? idx} className="flex items-center justify-between border border-slate-200 rounded-2xl p-4">
                        <div>
                          <p className="font-black text-slate-900">{idx + 1}. {r.entity_name ?? "—"}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1">Señales: {r.total_signals ?? 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 font-black">{Math.round((r.preference_rate ?? 0) * 100)}%</p>
                          <p className="text-xs text-slate-500 font-bold">Preferencia</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel 2: Mis señales previas */}
              <div className="border border-slate-200 rounded-3xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Mis señales</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Tu historial real.</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadMySignals}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Actualizar
                  </button>
                </div>

                {mySignalsLoading && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    Cargando tus señales...
                  </div>
                )}

                {mySignalsError && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700">
                    {mySignalsError}
                  </div>
                )}

                {!mySignalsLoading && !mySignalsError && mySignals.length === 0 && (
                  <div className="mt-6">
                    <EmptyState
                      title="Aún no tienes señales"
                      description="Participa en un versus para dejar tu marca."
                      icon="history"
                      actionLabel="Ir a participar"
                      onAction={() => nav("/experience")}
                    />
                  </div>
                )}

                {!mySignalsLoading && !mySignalsError && mySignals.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {mySignals.map((s) => (
                      <div key={`${s.created_at}-${s.option_id}`} className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            {s.image_url ? (
                              <img src={s.image_url} alt={s.entity_name ?? s.option_label ?? "Señal"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">•</div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {s.battle_title ?? "Versus"}
                            </div>

                            <div className="mt-1 text-sm text-gray-700">
                              Elegiste: <span className="font-semibold">{s.option_label ?? s.entity_name ?? "Opción"}</span>
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {new Date(s.created_at).toLocaleString()}
                              {typeof s.signal_weight === "number" ? ` • Peso: ${s.signal_weight.toFixed(2)}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Overlay lock premium */}
          {locked && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl">🔒</div>
                <h3 className="mt-4 text-xl font-black text-slate-900">Desbloquea Resultados</h3>
                Resultados disponibles para todos los usuarios.
                <button
                  type="button"
                  onClick={() => nav("/experience")}
                  className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 hover:opacity-95 text-white font-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Ir a participar
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
