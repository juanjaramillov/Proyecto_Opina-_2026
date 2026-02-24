import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { MIN_SIGNALS_THRESHOLD } from "../../../config/constants";

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const signalsToday = useSignalStore((s) => s.signalsToday);

  const isAuthenticated = !!profile && profile.tier !== "guest";
  const isProfileComplete = !!profile?.isProfileComplete;

  const primaryCta = useMemo(() => {
    if (!isAuthenticated) {
      return {
        label: "Entrar con invitación",
        action: () => navigate("/register"),
        hint: "Acceso limitado. Sí, te estamos cuidando el dato.",
      };
    }

    if (isAuthenticated && !isProfileComplete) {
      return {
        label: "Completar perfil",
        action: () => navigate("/complete-profile"),
        hint: "Sin perfil completo, tus señales valen menos. Y eso sería triste.",
      };
    }

    return {
      label: "Jugar ahora",
      action: () => navigate("/experience"),
      hint: "Versus, progresivo y profundidad. Todo en 10 segundos.",
    };
  }, [isAuthenticated, isProfileComplete, navigate]);

  const canSeeResults = (profile?.canSeeInsights ?? false) || (profile && profile.tier !== "guest" && ((profile as any)?.signalsLifetime ?? 0) >= MIN_SIGNALS_THRESHOLD);

  return (
    <div className="container-ws section-y space-y-10 pb-24">

      <PageHeader
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Beta cerrada
          </div>
        }
        title={
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-ink leading-[1.05]">
            Tu opinión es una <span className="text-gradient-brand">señal</span>.
          </h1>
        }
        subtitle={
          <p className="text-base md:text-lg text-muted font-medium max-w-2xl">
            No es encuesta. No es "me gusta". Es un motor de preferencia agregada. (Sí, suena serio. Lo es.)
          </p>
        }
        meta={
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="material-symbols-outlined text-[14px] text-indigo-500">bolt</span>
              Señales hoy: {signalsToday}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="material-symbols-outlined text-[14px] text-emerald-500">lock_open</span>
              {isAuthenticated ? "Acceso activo" : "Invitación requerida"}
            </div>
          </div>
        }
        actions={
          <div className="flex flex-col gap-2">
            <button
              onClick={primaryCta.action}
              className="btn-primary px-7 py-4 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              {primaryCta.label}
            </button>

            <p className="text-[11px] text-slate-400 font-medium text-center">{primaryCta.hint}</p>

            {isAuthenticated ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate("/results")}
                  className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 active:scale-95"
                  disabled={!canSeeResults}
                  title={!canSeeResults ? "Emite más señales para desbloquear" : "Ver resultados"}
                >
                  Resultados
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
                >
                  Perfil
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 active:scale-95"
                >
                  Ya tengo cuenta
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* BLOQUE 1 — Juega ahora */}
      <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              <span className="material-symbols-outlined text-[14px]">swords</span>
              Juega ahora
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink">
              Versus en 10 segundos
            </h2>
            <p className="text-sm md:text-base text-muted font-medium max-w-xl">
              Comparas 2 opciones, eliges una, y el sistema aprende. Rápido. Anónimo. Sin ensayos.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/experience")}
              className="h-11 px-5 rounded-xl bg-ink text-white font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg"
            >
              Empezar
            </button>

            <button
              onClick={() => navigate("/rankings")}
              className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
            >
              Ver rankings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">1</div>
            <div className="text-base font-black text-ink mt-1">Elige</div>
            <div className="text-sm text-muted mt-1">Una opción entre dos.</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">2</div>
            <div className="text-base font-black text-ink mt-1">Acumula</div>
            <div className="text-sm text-muted mt-1">Tu señal pesa según tu perfil.</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">3</div>
            <div className="text-base font-black text-ink mt-1">Mira</div>
            <div className="text-sm text-muted mt-1">Resultados y rankings cada 3h.</div>
          </div>
        </div>
      </section>

      {/* BLOQUE 2 — Tendencias (teaser, no dashboard) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                <span className="material-symbols-outlined text-[14px]">query_stats</span>
                Tendencias
              </div>
              <h3 className="text-xl md:text-2xl font-black text-ink mt-2">Lo que está subiendo</h3>
              <p className="text-sm text-muted font-medium mt-1">
                Esto se vuelve más interesante mientras más gente participa. (Sí, suena a red social. No lo es.)
              </p>
            </div>
            <button
              onClick={() => navigate("/results")}
              className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
            >
              Ver resultados
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Streaming", desc: "Quién domina hoy" },
              { title: "Bebidas", desc: "Preferencia y polarización" },
              { title: "Smartphones", desc: "Lealtad vs cambio" },
              { title: "Salud", desc: "Clínicas: percepción" },
            ].map((t) => (
              <div key={t.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</div>
                <div className="text-base font-black text-ink mt-1">{t.title}</div>
                <div className="text-sm text-muted mt-1">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Privacidad
          </div>

          <h3 className="text-xl md:text-2xl font-black text-ink mt-2">Anonimato por diseño</h3>
          <p className="text-sm text-muted font-medium mt-2">
            Nadie ve tu identidad real. Solo tu nickname. Y tu señal se agrega con otras.
          </p>

          <div className="mt-5 space-y-3">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Pro tip</div>
              <div className="text-sm font-bold text-indigo-900 mt-1">
                Completa perfil para segmentar resultados.
              </div>
              <div className="text-sm text-indigo-800/70 mt-1">
                No es por control. Es porque el dato vale más cuando tiene contexto.
              </div>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? "/profile" : "/register")}
              className="w-full h-11 px-5 rounded-xl bg-ink text-white font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg"
            >
              {isAuthenticated ? "Ver mi progreso" : "Crear cuenta"}
            </button>
          </div>
        </div>
      </section>

      {/* BLOQUE 3 — Cómo funciona */}
      <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="material-symbols-outlined text-[14px]">school</span>
              Cómo funciona
            </div>
            <h3 className="text-xl md:text-2xl font-black text-ink mt-2">Señales &gt; votos</h3>
            <p className="text-sm text-muted font-medium mt-1 max-w-2xl">
              Un voto es binario. Una señal puede ponderarse, segmentarse y evolucionar en el tiempo.
              (Tranquilo: tú solo aprietas un botón.)
            </p>
          </div>

          <button
            onClick={() => navigate("/about")}
            className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
          >
            Leer más
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Señal</div>
            <div className="text-base font-black text-ink mt-1">Ponderada</div>
            <div className="text-sm text-muted mt-1">Tu nivel y verificación influyen.</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Tiempo</div>
            <div className="text-base font-black text-ink mt-1">Evolución</div>
            <div className="text-sm text-muted mt-1">Guardamos historia para tendencias.</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">B2B</div>
            <div className="text-base font-black text-ink mt-1">Inteligencia</div>
            <div className="text-sm text-muted mt-1">Dashboards segmentables (más adelante).</div>
          </div>
        </div>
      </section>

    </div>
  );
}
