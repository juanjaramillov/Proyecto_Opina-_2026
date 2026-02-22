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
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600 mb-8 border border-slate-200 shadow-sm">
            Datos agregados · Snapshot optimizado cada 3 horas
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-tight mb-6">
            Tu opinión es una{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              señal
            </span>.
          </h1>

          {/* Segunda línea */}
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900 mb-8">
            El sistema la convierte en{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              tendencia verificable
            </span>.
          </h2>

          {/* Subtítulo */}
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            Cada preferencia suma precisión. Más señales, más claridad colectiva.
          </p>

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

          {/* Social proof */}
          <div className="mt-24">
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-[0.2em]">Señales activas sobre</p>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-70 hover:opacity-100 transition-opacity duration-500">
              <img src="/images/options/applemusic.png" className="h-7 md:h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300" alt="Apple Music" />
              <img src="/images/options/samsung.png" className="h-7 md:h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300" alt="Samsung" />
              <img src="/images/options/netflix.png" className="h-7 md:h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300" alt="Netflix" />
              <img src="/images/options/bmw.png" className="h-7 md:h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300" alt="BMW" />
            </div>
          </div>

        </div>
      </section>

      {/* RECENT ACTIVITY SECTION */}
      {recentActivity && (
        <section className="w-full py-6 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>
                {recentActivity.signals_last_3h?.toLocaleString()} señales en las últimas 3h
              </span>
            </div>
          </div>
        </section>
      )}

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
                          Peso Acumulado: {item.trend_score.toFixed(1)}
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

      {/* 2. TENDENCIAS (Qualitative Only) */}
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
