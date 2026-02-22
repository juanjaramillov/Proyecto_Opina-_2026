import { useState, useEffect } from "react";
import RightNowCarousel, { GenericSlide } from "../components/RightNowCarousel";
import { platformService, RecentActivity } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";

export default function Home() {
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
  }, [ageRange, gender, commune]); // Add filters to dependency array to re-fetch when they change

  // Map trending feed item to GenericSlide format
  const slidesData: GenericSlide[] = trendingFeed.slice(0, 5).map((item, idx) => ({
    id: item.id,
    context: `Tendencia #${idx + 1} • ${item.slug}`,
    value: item.title,
    label: `Señal detectada con un score de ${item.trend_score.toFixed(1)}`,
    source: "Opina+ Live Engine",
    path: `/battle/${item.id}`,
    aiInsight: "Patrón de opinión consolidado en este segmento."
  }));

  return (
    <div className="space-y-16 md:space-y-24 relative overflow-hidden pb-12 w-full bg-white">

      {/* 1. HERO */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-white px-6 py-32 overflow-hidden">
        {/* Fondo sutil tipo señal (muy leve, no llamativo) */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.4)_0%,_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Micro badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 text-xs font-black tracking-widest uppercase text-emerald-600 mb-8 border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
            <span className="relative flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Motor activo en tiempo real
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-6">
            Tu opinión es una{" "}
            <span className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-emerald-400 bg-clip-text text-transparent relative">
              señal
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-indigo-500/20 blur-md rounded-full"></div>
            </span>.
          </h1>

          {/* Segunda línea */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-8 tracking-tight">
            El sistema la convierte en{" "}
            <span className="bg-gradient-to-br from-indigo-500 to-emerald-400 bg-clip-text text-transparent border-b-4 border-emerald-200">
              inteligencia
            </span>.
          </h2>

          {/* Subtítulo dinámico con Data */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-2xl mx-auto mb-12">
            <p className="text-lg text-slate-600 font-medium">
              Cada preferencia suma precisión.
            </p>
            {recentActivity && (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                <span className="text-2xl font-black text-indigo-600">+{recentActivity.signals_last_3h?.toLocaleString()}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight text-left">Señales<br />hoy</span>
              </div>
            )}
          </div>

          {/* CTA principal */}
          <button
            onClick={() => window.location.href = '/experience'}
            className="group relative inline-flex items-center justify-center px-12 py-5 rounded-full text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              Emitir señal <span className="text-2xl leading-none group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>

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

      {/* RECENT ACTIVITY SECTION IS NOW INTEGRATED IN HERO */}

      {/* TRENDING FEED GROUPED */}
      <section className="w-full py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">

          {/* Segment Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Género</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los géneros</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Rango Etario</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Cualquier edad</option>
                <option value="under_18">Menores de 18</option>
                <option value="18-24">18-24 años</option>
                <option value="25-34">25-34 años</option>
                <option value="35-44">35-44 años</option>
                <option value="45-54">45-54 años</option>
                <option value="55-64">55-64 años</option>
                <option value="65_plus">65+ años</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Comuna</label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Sntgo (Todas)</option>
                <option value="Las Condes">Las Condes</option>
                <option value="Providencia">Providencia</option>
                <option value="Santiago">Santiago Centro</option>
                <option value="Vitacura">Vitacura</option>
                <option value="Maipú">Maipú</option>
                <option value="La Florida">La Florida</option>
              </select>
            </div>

            <div className="ml-auto text-xs text-slate-400 font-medium">
              Segmentación en tiempo real habilitada
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
                  <h2 className="text-2xl font-bold mb-6">
                    {category}
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    {top3.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                        onClick={() => window.location.href = `/battle/${item.id}`}
                      >
                        <div className="text-sm text-indigo-500 font-bold mb-2">
                          Puntuación de Tendencia: {item.trend_score.toFixed(1)}
                        </div>
                        <div className="text-lg font-semibold mb-2">
                          {item.title}
                        </div>
                        <div className="text-sm font-medium">
                          {item.slug}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                          <span>Signals: {item.total_signals}</span>
                          {item.direction === 'up' && (
                            <span className="text-emerald-600 font-bold">▲ +{item.variation_percent.toFixed(1)}%</span>
                          )}
                          {item.direction === 'down' && (
                            <span className="text-rose-600 font-bold">▼ {item.variation_percent.toFixed(1)}%</span>
                          )}
                          {item.direction === 'stable' && (
                            <span className="text-slate-400">— 0%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-10">
              No hay tendencias disponibles para los filtros seleccionados.
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
