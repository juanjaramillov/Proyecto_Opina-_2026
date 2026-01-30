import { useSignalStore } from '../../../store/signalStore';
import { useEntitlements } from "../../../hooks/useEntitlements";
import { supabase } from "../../../supabase/client";

export default function Profile() {
  const ent = useEntitlements();

  // Estado real (reactivo)
  const signal = useSignalStore();

  // Perfil demo (hasta que conectes profile real)
  const user = {
    name: "Juan",
    handle: "@juan_opina",
    city: "Santiago",
    country: "Chile",
    ageRange: "25–34",
    commune: "Ñuñoa",
    interests: ["Economía", "Trabajo", "Tecnología", "Cultura", "Movilidad"],
    signalsTotal: signal.signals,
    streak: signal.streakDays,
    level: signal.level,
    // Usamos progressPct como XP demo (0..100)
    xp: signal.progressPct,
    xpToNext: 100,
  };

  const history = [
    { topic: "Trabajo", versus: "4 días vs tradicional", choice: "4 días", impact: "+15", date: "Hoy" },
    { topic: "Movilidad", versus: "Ciclovías vs autopistas", choice: "Ciclovías", impact: "+14", date: "Ayer" },
    { topic: "Educación", versus: "Finanzas vs Arte", choice: "Finanzas", impact: "+16", date: "Ayer" },
    { topic: "Consumo", versus: "Local vs importado", choice: "Local", impact: "+13", date: "Hace 2 días" },
    { topic: "Política pública", versus: "Fiscalización vs incentivos", choice: "Incentivos", impact: "+12", date: "Hace 3 días" },
  ];

  const badges = [
    { name: "Señalador Serial", desc: "50+ señales emitidas", emoji: "📡" },
    { name: "Racha de Fuego", desc: "7 días seguidos", emoji: "🔥" },
    { name: "Opinión con Criterio", desc: "10 temas distintos", emoji: "🧠" },
    { name: "Ciudadano Beta", desc: "usuario temprano", emoji: "🧪" },
  ];

  const pct = Math.round((user.xp / user.xpToNext) * 100);

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Estás seguro? Esta acción borrará tu perfil y anonimizará tus señales. No se puede deshacer.")) return;

    // Call RPC
    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      alert("Error al borrar cuenta: " + error.message);
    } else {
      alert("Cuenta eliminada correctamente.");
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <div className="container-ws section-y">

      {/* BLOQUE NUEVO: estado de desbloqueos y límites */}
      <section className="card card-pad fade-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Estado de acceso</div>
            <div className="text-xs text-text-muted mt-1">{ent.nextUnlockHint}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge">🎯 Hoy: {ent.signalsLeftToday} / {ent.maxSignalsPerDay} señales</span>
            <span className={`badge ${ent.canAccessRadiografias ? "badge-primary" : ""}`}>
              📊 Radiografías: {ent.canAccessRadiografias ? "ON" : "LOCK"}
            </span>
            <span className={`badge ${ent.canEditAnswers ? "badge-primary" : ""}`}>
              ✍️ Editar: {ent.canEditAnswers ? "ON" : "LOCK"}
            </span>
            <span className={`badge ${ent.canSeeAdvancedFilters ? "badge-primary" : ""}`}>
              🧩 Filtros: {ent.canSeeAdvancedFilters ? "ON" : "LOCK"}
            </span>
          </div>
        </div>
      </section>

      <section className="card card-pad fade-up mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary/25 to-accent/25 border border-stroke flex items-center justify-center text-xl font-extrabold">
              J
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold">{user.name}</h1>
                <span className="badge">{user.handle}</span>
                <span className="badge-primary">Nivel {user.level}</span>
              </div>
              <p className="text-text-secondary text-sm mt-0.5">
                {user.commune} · {user.city}, {user.country} · {user.ageRange}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge">🔥 {user.streak} racha</span>
            <span className="badge">📡 {user.signalsTotal} señales</span>
            <span className="badge">🗺️ {user.commune}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-text-secondary">Progreso al siguiente nivel</span>
            <span className="grad-text">{pct}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-surface2 overflow-hidden">
            <div className="h-3 bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-xs text-text-muted">{user.xp} / {user.xpToNext} XP</div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">

        <section className="card card-pad card-hover fade-up">
          <h2 className="text-base font-bold">Intereses</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.interests.map((t) => (<span key={t} className="badge">{t}</span>))}
          </div>
          <button className="btn-secondary w-full mt-4">Editar</button>
        </section>

        <section className="card card-pad card-hover fade-up">
          <h2 className="text-base font-bold">Badges</h2>
          <div className="mt-3 space-y-2">
            {badges.map((b) => (
              <div key={b.name} className="flex items-start gap-3 p-3 rounded-2xl bg-surface2">
                <div className="text-lg">{b.emoji}</div>
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-text-muted">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-pad card-hover fade-up">
          <h2 className="text-base font-bold">Resumen</h2>
          <div className="mt-3 space-y-2">
            <div className="p-3 rounded-2xl bg-surface2 flex justify-between">
              <span className="text-xs font-semibold text-text-secondary">Temas top</span>
              <span className="text-sm font-semibold">Trabajo · Movilidad</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface2 flex justify-between">
              <span className="text-xs font-semibold text-text-secondary">Perfil (demo)</span>
              <span className="text-sm font-semibold">Urbano · Tech-friendly</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface2 flex justify-between">
              <span className="text-xs font-semibold text-text-secondary">Sesgo (demo)</span>
              <span className="text-sm font-semibold">Pro-eficiencia</span>
            </div>
          </div>
          <button className="btn-primary w-full mt-4">Ver historial</button>
        </section>

      </div>

      <section className="card card-pad fade-up mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">Historial reciente</h2>
          <span className="badge">últimas 5</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-stroke">
          <div className="grid grid-cols-12 bg-surface2 px-4 py-2 text-xs font-semibold text-text-secondary">
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2">Tema</div>
            <div className="col-span-6">Versus</div>
            <div className="col-span-1">Elección</div>
            <div className="col-span-1 text-right">XP</div>
          </div>

          {history.map((h, i) => (
            <div key={i} className="grid grid-cols-12 px-4 py-2 text-sm border-t border-stroke">
              <div className="col-span-2 text-text-muted">{h.date}</div>
              <div className="col-span-2 font-semibold">{h.topic}</div>
              <div className="col-span-6 text-text-secondary">{h.versus}</div>
              <div className="col-span-1"><span className="badge">{h.choice}</span></div>
              <div className="col-span-1 text-right font-semibold">{h.impact}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mt-12 pt-8 border-t border-stroke text-center">
        <button
          onClick={handleDeleteAccount}
          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
        >
          Eliminar mi cuenta y mis datos
        </button>
      </section>

    </div>
  );
}
