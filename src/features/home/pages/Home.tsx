import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TrendingInsightsCarousel from "../components/TrendingInsightsCarousel";
import { platformService, RecentActivity } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";
import { useAuth } from "../../auth";

export default function Home() {
  const { profile } = useAuth();
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [trendingFeed, setTrendingFeed] = useState<TrendingItem[]>([]);

  // State for filter controls
  const [ageRange, setAgeRange] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');
  const [commune, setCommune] = useState<string>('all');

  useEffect(() => {
    platformService.getRecentActivity().then(data => {
      if (data) setRecentActivity(data);
    });

    async function loadFeed() {
      // Use the new segmented trending service with current filters
      const data = await platformService.getSegmentedTrending(ageRange, gender, commune);
      setTrendingFeed(data);
    }

    loadFeed();
    loadFeed();
  }, [ageRange, gender, commune]);

  const lastSnapshotAt = useMemo(() => {
    if (!trendingFeed?.length) return null;
    let max = 0;
    for (const item of trendingFeed) {
      const snapItem = item as unknown as { snapshot_at?: string };
      if (!snapItem.snapshot_at) continue;
      const t = new Date(snapItem.snapshot_at).getTime();
      if (t > max) max = t;
    }
    return max ? new Date(max).toISOString() : null;
  }, [trendingFeed]);

  const lastSnapshotLabel = useMemo(() => {
    if (!lastSnapshotAt) return "—";
    return new Date(lastSnapshotAt).toLocaleString("es-CL", {
      hour12: false,
      dateStyle: "short",
      timeStyle: "short",
    });
  }, [lastSnapshotAt]);

  // CTA logic
  const isAuthenticated = profile && profile.tier !== 'guest';
  const mainCtaText = isAuthenticated ? "Participar y descubrir →" : "Unirte y empezar →";
  const mainCtaPath = isAuthenticated ? "/experience" : "/register";

  const SELECT_CLS = "w-full sm:w-auto px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 text-sm appearance-none shadow-sm cursor-pointer hover:border-slate-200";

  return (
    <div className="space-y-16 md:space-y-24 relative overflow-hidden pb-12 w-full bg-white">

      {/* 1. HERO */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-white px-6 py-32 overflow-hidden">
        {/* Fondo sutil tipo señal (muy leve, no llamativo) */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.15)_0%,_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Micro badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 text-xs font-black tracking-widest uppercase text-emerald-600 mb-8 border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
            <span className="relative flex flex-col items-center gap-0.5">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Actualizado cada 3 horas
              </span>

              <span className="text-[10px] font-bold tracking-normal text-emerald-700/70">
                Últ. snapshot: {lastSnapshotLabel}
              </span>
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-6">
            Descubre cómo piensa tu{" "}
            <span className="bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 bg-clip-text text-transparent relative">
              generación
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary-500/20 blur-md rounded-full"></div>
            </span>.
          </h1>

          {/* Segunda línea */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-600 mb-8 tracking-tight max-w-3xl mx-auto leading-relaxed">
            Sube de nivel, compara tus ideas con miles de personas y haz que tu voz defina las{" "}
            <span className="bg-gradient-to-br from-primary-500 to-emerald-400 bg-clip-text text-transparent border-b-4 border-emerald-200">
              tendencias del futuro
            </span>.
          </h2>

          {/* Estadísticas de la Comunidad B2C */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto mb-12">

            {recentActivity ? (
              <>
                <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-primary-100 shadow-lg w-full md:w-auto">
                  <span className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    {recentActivity.active_users_24h?.toLocaleString() || '15,000+'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Usuarios Activos</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-lg w-full md:w-auto">
                  <span className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    {recentActivity.total_signals?.toLocaleString() || '2.5M+'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Señales Procesadas</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-amber-100 shadow-lg w-full md:w-auto">
                  <span className="text-4xl font-black bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                    +{recentActivity.signals_last_3h?.toLocaleString() || '1,200'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Últimas 3h</span>
                </div>
              </>
            ) : (
              <div className="h-[100px] w-full max-w-md mx-auto animate-pulse bg-slate-100 rounded-2xl"></div>
            )}
          </div>

          {/* CTA principal ÚNICO */}
          <div className="flex justify-center mb-8">
            <Link
              to={mainCtaPath}
              className="group relative inline-flex items-center justify-center px-12 py-5 rounded-full text-xl font-black text-white bg-gradient-to-r from-primary-600 to-emerald-500 hover:opacity-95 transition-all duration-300 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-1 active:scale-[0.98] overflow-hidden uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">
                {mainCtaText}
              </span>
            </Link>
          </div>
          {!isAuthenticated && (
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              ¿Ya tienes cuenta? <Link to="/login" className="text-primary-600 hover:text-primary-800 underline decoration-primary-300 hover:decoration-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded-sm">Inicia sesión aquí</Link>
            </p>
          )}

          {/* Social proof / Mini Charts */}
          <div className="mt-24 max-w-4xl mx-auto">
            <p className="text-[10px] text-slate-400 mb-8 font-black uppercase tracking-[0.3em]">Top Tendencias Actuales</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingFeed.slice(0, 3).map((item, idx) => (
                <div key={item.id} className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-5 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl font-black text-slate-200 group-hover:text-primary-100 transition-colors">0{idx + 1}</span>
                    {item.direction === 'up' && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase">+{item.variation_percent.toFixed(1)}%</span>}
                    {item.direction === 'down' && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase">-{item.variation_percent.toFixed(1)}%</span>}
                    {item.direction === 'stable' && <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase">—</span>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">{item.slug}</p>

                  {/* Micro sparkline visual mock */}
                  <div className="h-6 w-full flex items-end gap-1 opacity-60">
                    {[40, 60, 45, 80, 75, 90, item.direction === 'up' ? 100 : 85].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm transition-all duration-700 ${i === 6 ? 'bg-primary-500 w-2' : 'bg-slate-200'}`} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* TRENDING FEED GROUPED */}
      <section className="w-full py-16 bg-slate-50/50 border-t border-slate-100">
        <div className="w-full max-w-[1600px] mx-auto px-6">

          <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tendencias por Segmento</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Filtra la inteligencia colectiva en tiempo real.</p>
            </div>

            {/* Segment Filters (Premiumized) */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="all">Todo género</option>
                  <option value="male">Hombres</option>
                  <option value="female">Mujeres</option>
                  <option value="other">Otro</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
              </div>

              <div className="relative">
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="all">Toda edad</option>
                  <option value="under_18">-18 años</option>
                  <option value="18-24">18-24 años</option>
                  <option value="25-34">25-34 años</option>
                  <option value="35-44">35-44 años</option>
                  <option value="45-54">45-54 años</option>
                  <option value="55-64">55-64 años</option>
                  <option value="65_plus">65+ años</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
              </div>

              <div className="relative">
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="all">Todo RM</option>
                  <option value="Las Condes">Las Condes</option>
                  <option value="Providencia">Providencia</option>
                  <option value="Santiago">Stgo Centro</option>
                  <option value="Vitacura">Vitacura</option>
                  <option value="Maipú">Maipú</option>
                  <option value="La Florida">La Florida</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          {/* CAROUSEL */}
          <div className="mt-8">
            <TrendingInsightsCarousel data={trendingFeed.slice(0, 10)} filters={{ ageRange, gender, commune }} />
          </div>
        </div>
      </section>

      {/* 3. SOFT CLOSE */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 text-center pb-12">
        <div className="w-12 h-0.5 bg-slate-100 mx-auto mb-8"></div>
        <p className="text-lg text-slate-500 font-medium italic">
          "Cada opinión suma. No hay respuestas correctas, solo nuevas formas de ver el mundo."
        </p>
      </section>

      {/* FOOTER TEASER - Minimal */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 text-center pb-8 opacity-30">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Opina+ Beta</p>
      </section>
    </div>
  );
}
