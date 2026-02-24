import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import RightNowCarousel, { GenericSlide } from "../components/RightNowCarousel";
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
  const mainCtaText = isAuthenticated ? "Jugar y descubrir →" : "Unirte y empezar →";
  const mainCtaPath = isAuthenticated ? "/experience" : "/register";

  // Map trending feed item to GenericSlide format
  const slidesData: GenericSlide[] = trendingFeed.slice(0, 5).map((item, idx) => ({
    id: item.id,
    context: `Tendencia #${idx + 1} • ${item.slug}`,
    value: item.title,
    label: `Señal detectada con un score de ${item.trend_score.toFixed(1)}`,
    source: "Opina+ Live Engine",
    path: `/battle/${item.slug}`,
    aiInsight: "Patrón de opinión consolidado en este segmento."
  }));

  const SELECT_CLS = "w-full sm:w-auto px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 text-sm appearance-none shadow-sm cursor-pointer hover:border-slate-200";

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
            <span className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-emerald-400 bg-clip-text text-transparent relative">
              generación
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-indigo-500/20 blur-md rounded-full"></div>
            </span>.
          </h1>

          {/* Segunda línea */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-600 mb-8 tracking-tight max-w-3xl mx-auto leading-relaxed">
            Sube de nivel, compara tus ideas con miles de personas y haz que tu voz defina las{" "}
            <span className="bg-gradient-to-br from-indigo-500 to-emerald-400 bg-clip-text text-transparent border-b-4 border-emerald-200">
              tendencias del futuro
            </span>.
          </h2>

          {/* Estadísticas de la Comunidad B2C */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto mb-12">

            {recentActivity ? (
              <>
                <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-lg w-full md:w-auto">
                  <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
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
              className="group relative inline-flex items-center justify-center px-12 py-5 rounded-full text-xl font-black text-white bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-[0.98] overflow-hidden uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">
                {mainCtaText}
              </span>
            </Link>
          </div>
          {!isAuthenticated && (
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 hover:decoration-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-sm">Inicia sesión aquí</Link>
            </p>
          )}

          {/* Social proof / Mini Charts */}
          <div className="mt-24 max-w-4xl mx-auto">
            <p className="text-[10px] text-slate-400 mb-8 font-black uppercase tracking-[0.3em]">Top Tendencias Actuales</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingFeed.slice(0, 3).map((item, idx) => (
                <div key={item.id} className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-5 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors">0{idx + 1}</span>
                    {item.direction === 'up' && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase">+{item.variation_percent.toFixed(1)}%</span>}
                    {item.direction === 'down' && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase">-{item.variation_percent.toFixed(1)}%</span>}
                    {item.direction === 'stable' && <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase">—</span>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">{item.slug}</p>

                  {/* Micro sparkline visual mock */}
                  <div className="h-6 w-full flex items-end gap-1 opacity-60">
                    {[40, 60, 45, 80, 75, 90, item.direction === 'up' ? 100 : 85].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm transition-all duration-700 ${i === 6 ? 'bg-indigo-500 w-2' : 'bg-slate-200'}`} style={{ height: `${h}%` }}></div>
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
        <div className="max-w-6xl mx-auto px-6">

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

          {trendingFeed.length > 0 ? (
            Object.entries(
              trendingFeed.reduce((acc: Record<string, TrendingItem[]>, item: TrendingItem) => {
                const category = "Global"; // Default category as TrendingItem doesn't have it explicitly
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
              }, {})
            ).map(([category, items]: [string, TrendingItem[]]) => {
              const top3 = items.slice(0, 3);

              return (
                <div key={category} className="mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {top3.map((item) => (
                      <Link
                        key={item.id}
                        to={`/battle/${item.slug}`}
                        className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label={`Ir a la batalla de ${item.title}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                            <span className="material-symbols-outlined text-[14px] text-indigo-500">local_fire_department</span>
                            <span className="text-[11px] font-black text-indigo-700 tracking-wider">SCORE {item.trend_score.toFixed(1)}</span>
                          </div>
                          {item.direction === 'up' && (
                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{item.variation_percent.toFixed(1)}%</span>
                          )}
                          {item.direction === 'down' && (
                            <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">-{item.variation_percent.toFixed(1)}%</span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                          {item.slug}
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bolt</span> {item.total_signals} señales</span>
                          <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-1">Ver insights <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center bg-white border border-slate-100 rounded-3xl p-12 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">filter_alt_off</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No hay suficientes datos</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Este cruce de filtros es muy específico. Intenta ampliar el rango de edad o comuna para ver tendencias emergentes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS (VISUAL DIAGRAM) */}
      <section className="w-full py-16 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-800">Cómo funciona el motor</h2>
            <p className="text-slate-500 mt-2 font-medium">De una opinión individual a una señal parametrizada.</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-100 via-indigo-200 to-emerald-200 -translate-y-1/2 z-0 rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner group-hover:bg-indigo-50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-indigo-500">touch_app</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">1. Emites Señal</h3>
                <p className="text-xs text-slate-500 font-medium">Votas en Versus o respondes métricas de Profundidad.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 delay-75">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner group-hover:bg-indigo-50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-indigo-500">scale</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">2. Ponderación</h3>
                <p className="text-xs text-slate-500 font-medium">El algoritmo garantiza la representatividad y calidad de cada señal emitida.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 delay-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner group-hover:bg-emerald-50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-emerald-500">account_tree</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">3. Integración</h3>
                <p className="text-xs text-slate-500 font-medium">Tu señal se inyecta en el Data Warehouse al instante.</p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl shadow-slate-800/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 delay-150 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20"></div>
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-inner group-hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">monitoring</span>
                </div>
                <h3 className="relative z-10 text-sm font-black uppercase tracking-widest text-white mb-2">4. Impacto Global</h3>
                <p className="relative z-10 text-xs text-slate-400 font-medium">Alteración inmediata de los rankings globales y por segmento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-8 md:mb-10 text-center">
          <h2 className="text-sm md:text-base font-bold text-slate-500 tracking-widest uppercase">Patrones en la Red</h2>
          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            Tecnología que conecta a personas que no se conocen. Patrones reales, sin promedios aburridos.
          </p>
        </div>
        <RightNowCarousel readOnly={true} data={slidesData} />
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
