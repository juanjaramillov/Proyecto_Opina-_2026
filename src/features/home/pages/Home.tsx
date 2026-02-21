import { useState, useEffect } from "react";
import RightNowCarousel, { GenericSlide } from "../components/RightNowCarousel";
import { platformService, RecentActivity } from "../../signals/services/platformService";

export default function Home() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendingFeed, setTrendingFeed] = useState<any[]>([]);

  useEffect(() => {
    platformService.getRecentActivity().then(data => {
      if (data) setRecentActivity(data);
    });

    async function loadFeed() {
      const data = await platformService.getTrendingFeedGrouped();
      setTrendingFeed(data);
    }

    loadFeed();
  }, []);

  // Map trending feed item to GenericSlide format
  const slidesData: GenericSlide[] = trendingFeed.slice(0, 5).map((item, idx) => ({
    id: item.option_id,
    context: `Tendencia #${idx + 1} • ${item.category}`,
    value: item.trend_status === 'subiendo' ? `+${item.delta_weight}x` : item.option_name,
    label: item.trend_status === 'subiendo' ? `${item.option_name} está ganando inercia acelerada` : `Señal consistente del segmento principal.`,
    source: "Opina+ Live Engine",
    path: `/battle/${item.battle_id}`,
    aiInsight: item.trend_status === 'subiendo' ? "El spread de opinión se está ampliando." : "Fuerte consolidación detectada."
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
            Datos agregados en tiempo real · Snapshot cada 3 horas
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
      {trendingFeed.length > 0 && (
        <section className="w-full py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            {Object.entries(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              trendingFeed.reduce((acc: any, item: any) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {})
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ).map(([category, items]: any) => {
              const top3 = items.slice(0, 3);

              return (
                <div key={category} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">
                    {category}
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {top3.map((item: any) => (
                      <div
                        key={item.option_id}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                        onClick={() => window.location.href = `/battle/${item.battle_id}`}
                      >
                        <div className="text-sm text-gray-400 mb-2">
                          #{item.rank_position}
                        </div>
                        <div className="text-lg font-semibold mb-2">
                          {item.option_name}
                        </div>
                        <div className="text-sm font-medium">
                          {item.trend_status}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Δ {item.delta_weight}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
