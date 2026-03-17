import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TrendingInsightsCarousel from "../components/TrendingInsightsCarousel";
import { platformService } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";
import { useAuth } from "../../auth";
import { trackEvent } from "../../../services/analytics/trackEvent";

export default function Home() {
  const { profile } = useAuth();
  const [trendingFeed, setTrendingFeed] = useState<TrendingItem[]>([]);

  useEffect(() => {
    async function loadFeed() {
      trackEvent('user_entered_home', { is_authenticated: !!profile && profile.tier !== 'guest' });
      // Default to global feed on home page
      const data = await platformService.getSegmentedTrending('all', 'all', 'all');
      setTrendingFeed(data);
    }

    loadFeed();
  }, [profile]);

  const isAuthenticated = profile && profile.tier !== 'guest';
  const mainCtaText = isAuthenticated ? "Emite tu señal" : "Empezar";
  const mainCtaPath = isAuthenticated ? "/signals" : "/register";
  const mainCtaState = isAuthenticated ? { category: 'mix', autoStart: true } : undefined;

  return (
    <div className="w-full bg-white text-ink font-sans selection:bg-primary-100 selection:text-primary-900">

      {/* 1. HERO MAIN */}
      <section className="relative w-full pt-32 pb-24 px-6 max-w-ws mx-auto flex flex-col items-center justify-center text-center">
        <div className="badge badge-primary mb-6 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          La nueva era del análisis de sentimiento
        </div>

        <h1 className="h1 max-w-4xl mb-6 tracking-tight leading-[1.1] animate-fade-up" style={{ animationDelay: '50ms' }}>
          Transforma opiniones en <span className="text-gradient-brand">inteligencia colectiva</span>
        </h1>

        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-12 leading-relaxed font-medium animate-fade-up" style={{ animationDelay: '100ms' }}>
          La plataforma de inteligencia que transforma opiniones individuales en tendencias predictivas. Sin ruido, sin bots, solo señales reales.
        </p>

        <div className="flex flex-col items-center justify-center w-full mb-20 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <Link to={mainCtaPath} state={mainCtaState} className="btn-hero min-w-[280px]">
            {mainCtaText}
          </Link>
        </div>

        {/* Hero Vista Previa */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl border border-stroke shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-slate-50 aspect-[16/9] sm:aspect-[21/9] flex flex-col relative animate-fade-up overflow-hidden group" style={{ animationDelay: '200ms' }}>

          {/* Header UI */}
          <div className="h-14 sm:h-16 bg-white border-b border-stroke flex items-center justify-between px-4 sm:px-6 relative z-20 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl sm:text-2xl text-primary">monitoring</span>
              </div>
              <span className="font-bold text-ink text-sm sm:text-base tracking-tight">Opina+ Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Server
              </div>
            </div>
          </div>

          {/* Body UI */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 relative z-10 w-full overflow-hidden">
            {/* Gradient Mask & Center CTA */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-30 pointer-events-none flex flex-col items-center justify-end pb-8 sm:pb-12">
              <Link to="/results" className="pointer-events-auto bg-ink text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 group-hover:-translate-y-2 group-hover:bg-slate-800 transition-all duration-500">
                <span className="material-symbols-outlined text-emerald-400 text-lg">public</span>
                <span className="hidden sm:inline font-bold text-sm tracking-wide">Desbloquear el Dashboard</span>
                <span className="sm:hidden font-bold text-sm tracking-wide">Desbloquear</span>
                <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward</span>
              </Link>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              {[
                { label: 'Señales Activas', value: '124.5K', icon: 'electric_bolt', color: 'text-emerald-500', bg: 'bg-emerald-50', change: '4.2%' },
                { label: 'Usuarios Únicos', value: '45.2K', icon: 'group', color: 'text-blue-500', bg: 'bg-blue-50', change: '2.1%' },
                { label: 'Impacto Global', value: '98.4%', icon: 'language', color: 'text-indigo-500', bg: 'bg-indigo-50', change: '8.7%' },
                { label: 'Evaluaciones Live', value: '142', icon: 'compare_arrows', color: 'text-rose-500', bg: 'bg-rose-50', change: '1.5%' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-3 sm:p-5 rounded-2xl border border-stroke shadow-sm flex flex-col justify-between h-20 sm:h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider hidden sm:block">{kpi.label}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider sm:hidden truncate">{kpi.label.split(' ')[0]}</span>
                    <span className={`material-symbols-outlined text-sm sm:text-base ${kpi.color}`}>{kpi.icon}</span>
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-ink tracking-tight mt-auto flex items-baseline gap-1">
                    {kpi.value}
                    <span className="text-[10px] sm:text-xs text-emerald-500 font-bold flex items-center">
                      <span className="material-symbols-outlined text-[10px] sm:text-xs">arrow_drop_up</span>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Row */}
            <div className="flex-1 flex gap-4 sm:gap-6 min-h-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              {/* Exploración Gráfica */}
              <div className="flex-[2] bg-white rounded-2xl border border-stroke shadow-sm p-4 sm:p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-ink">Evolución en Tiempo Real</span>
                    <span className="text-[10px] text-text-muted font-medium hidden sm:block">Volumen de señales procesadas</span>
                  </div>
                  <div className="flex gap-1 items-end">
                    <div className="w-1.5 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-1.5 h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-1.5 h-6 bg-primary/40 rounded-full"></div>
                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 relative flex items-end justify-between gap-1 sm:gap-2 pb-2">
                  {[30, 45, 25, 60, 80, 50, 40, 60, 90, 85, 45, 70, 80, 60, 50, 40, 75, 85, 95, 65, 80, 90, 85, 100].map((height, i) => {
                    const isPrimary = i > 18;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm transition-all duration-1000 ${isPrimary ? 'bg-gradient-to-t from-primary/40 to-primary/80' : 'bg-slate-100'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Feed Simulado Visualmente */}
              <div className="flex-1 bg-white rounded-2xl border border-stroke shadow-sm p-4 sm:p-5 hidden md:flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-ink">Últimas Interacciones</span>
                </div>
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xs text-text-muted">account_circle</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                        <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUÉ ES UNA SEÑAL */}
      <section className="py-24 bg-white">
        <div className="container-ws">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="h2 mb-4">¿Por qué <span className="text-gradient-brand">Señales</span> y no encuestas?</h2>
            <p className="body-base">
              Las señales son microinteracciones validadas que, agregadas en volumen, construyen el mapa más preciso de la opinión pública.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card card-pad border-t-4 border-t-primary flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">touch_app</span>
              </div>
              <div>
                <h3 className="h3 mb-2 text-base">Participa</h3>
                <p className="body-caption">Microinteracciones de 3 segundos sobre temas relevantes de hoy.</p>
              </div>
            </div>

            <div className="card card-pad border-t-4 border-t-secondary flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">compare_arrows</span>
              </div>
              <div>
                <h3 className="h3 mb-2 text-base">Compara</h3>
                <p className="body-caption">Contrasta tu visión del mundo con el consenso general de forma inmediata.</p>
              </div>
            </div>

            <div className="card card-pad border-t-4 border-t-sky-500 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <h3 className="h3 mb-2 text-base">Descubre</h3>
                <p className="body-caption">Explora tendencias emergentes antes de que se vuelvan noticia.</p>
              </div>
            </div>

            <div className="card card-pad border-t-4 border-t-ink flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-ink/5 text-ink flex items-center justify-center">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <div>
                <h3 className="h3 mb-2 text-base">Transmuta</h3>
                <p className="body-caption">Convierte tu opinión individual en inteligencia colectiva de alto valor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="py-24 bg-surface2 border-y border-stroke">
        <div className="container-ws">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="h2 mb-4">Un ciclo de <span className="text-gradient-brand">inteligencia natural</span></h2>
            <p className="body-base">
              Construimos tecnología invisible diseñada para fluir con tu comportamiento natural,
              entregando valor instantáneo en cada paso.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
            {/* Line connecting steps */}
            <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-stroke -z-10 translate-y-[-50%]"></div>

            <div className="flex-1 bg-white p-8 rounded-3xl border border-stroke shadow-sm relative text-center">
              <div className="w-12 h-12 rounded-full bg-white border-4 border-surface2 shadow-sm text-primary font-black flex items-center justify-center mx-auto -mt-14 mb-6">1</div>
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">smart_button</span>
              <h4 className="text-lg font-black text-ink mb-3">Emitir Señal</h4>
              <p className="text-sm text-text-secondary">Abres la app, reaccionas a un debate, marca o tendencia pulsando una opción simple.</p>
            </div>

            <div className="flex-1 bg-white p-8 rounded-3xl border border-stroke shadow-sm relative text-center">
              <div className="w-12 h-12 rounded-full bg-white border-4 border-surface2 shadow-sm text-primary font-black flex items-center justify-center mx-auto -mt-14 mb-6">2</div>
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">hub</span>
              <h4 className="text-lg font-black text-ink mb-3">Agregación</h4>
              <p className="text-sm text-text-secondary">Nuestro motor limpia el ruido, verifica la identidad y agrega miles de señales en milisegundos.</p>
            </div>

            <div className="flex-1 bg-white p-8 rounded-3xl border border-stroke shadow-sm relative text-center">
              <div className="w-12 h-12 rounded-full bg-white border-4 border-surface2 shadow-sm text-primary font-black flex items-center justify-center mx-auto -mt-14 mb-6">3</div>
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">donut_small</span>
              <h4 className="text-lg font-black text-ink mb-3">Inteligencia</h4>
              <p className="text-sm text-text-secondary">El dato se cruza demográficamente, revelando insights profundos sobre cómo piensa el mercado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUÉ PUEDES EXPLORAR */}
      <section className="py-24 bg-white">
        <div className="container-ws">
          <div className="mb-16">
            <h2 className="h2 mb-4">Todo está sujeto a <span className="text-gradient-brand">señal</span></h2>
            <p className="body-base max-w-2xl">
              Desde las marcas que configuran tu consumo diario hasta las políticas públicas que definen el país. Si importa, está siendo medido.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card Marcas */}
            <div className="col-span-1 lg:col-span-2 bg-slate-50 rounded-3xl p-8 border border-stroke hover:border-slate-300 transition-colors flex flex-col justify-between aspect-square lg:aspect-auto">
              <div>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                  <span className="material-symbols-outlined text-xl">storefront</span>
                </span>
                <h3 className="text-2xl font-black text-ink mb-2">Marcas y Consumo</h3>
                <p className="text-sm text-text-secondary">¿Coca-Cola o Pepsi? Percibe cómo fluctúa el capital de marca de las empresas top del país a nivel micro-demográfico.</p>
              </div>
            </div>

            {/* Card Versus */}
            <div className="col-span-1 lg:col-span-3 bg-surface2 rounded-3xl p-8 border border-stroke hover:border-slate-300 transition-colors flex flex-col justify-between aspect-square lg:aspect-auto overflow-hidden relative">
              <div className="relative z-10 w-2/3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand"></span> Versus
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">Combates directos</h3>
                <p className="text-sm text-text-secondary">Un ganador y un perdedor. Opciones dicotómicas presentadas limpiamente para entender las verdaderas preferencias forzadas.</p>
              </div>
              {/* Visual hint */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white rounded-full border-[8px] border-surface2 flex items-center justify-center shadow-lg opacity-50">
                <span className="text-5xl font-black text-slate-200 italic">VS</span>
              </div>
            </div>

            {/* Card Politica */}
            <div className="col-span-1 lg:col-span-3 bg-slate-50 rounded-3xl p-8 border border-stroke hover:border-slate-300 transition-colors">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600 mb-4">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </span>
              <h3 className="text-2xl font-black text-ink mb-2">Política y Actualidad</h3>
              <p className="text-sm text-text-secondary max-w-sm">Más allá de la encuesta clásica. Señales rápidas sobre debates, leyes y figuras públicas mientras la noticia está ocurriendo.</p>
            </div>

            {/* Card Lifestyle (2 cols) */}
            <div className="col-span-1 lg:col-span-2 bg-slate-50 rounded-3xl p-8 border border-stroke hover:border-slate-300 transition-colors">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600 mb-4">
                <span className="material-symbols-outlined text-xl">nightlife</span>
              </span>
              <h3 className="text-2xl font-black text-ink mb-2">Vida Cotidiana</h3>
              <p className="text-sm text-text-secondary">Entretenimiento, cine, streaming, hábitos. Las señales culturales que definen el espíritu de la época.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEÑALES EN ACCIÓN (LIVE FEED) */}
      <section className="py-24 bg-surface2 border-y border-stroke overflow-hidden">
        <div className="container-ws">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="label-sm text-secondary">Live Feed</span>
              </div>
              <h2 className="h2 mb-2">Tendencias en <span className="text-gradient-brand">tiempo real</span></h2>
              <p className="body-base">El termómetro social del país en este preciso instante.</p>
            </div>

            <Link to="/results" className="btn-ghost flex items-center gap-2 text-primary-600 font-bold hover:text-emerald-500 transition-colors">
              Ver todas las tendencias <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="-mx-4 sm:mx-0">
            <TrendingInsightsCarousel data={trendingFeed.slice(0, 10)} filters={{ ageRange: 'all', gender: 'all', commune: 'all' }} />
          </div>
        </div>
      </section>

      {/* 6. INTELIGENCIA PARA EMPRESAS */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="container-ws relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-5/12">
              <div className="inline-block px-3 py-1 bg-ink text-white rounded-full text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm">
                Opina+ Enterprise
              </div>
              <h2 className="h1 mb-6">
                Inteligencia cruda y directa para <span className="text-gradient-brand">decisores</span>.
              </h2>
              <p className="body-base mb-8">
                Las señales de los usuarios alimentan un panel B2B de inteligencia en tiempo real. Obtén tabulaciones cruzadas instantáneas, descargas en CSV y acceso vía API.
              </p>

              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div>
                    <strong className="block text-sm font-black text-ink">Segmentación Granular</strong>
                    <span className="text-sm text-text-secondary">Capacidad de aislar clusters por edad, género, NSE y ubicación geográfica.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div>
                    <strong className="block text-sm font-black text-ink">Zero Data Lag</strong>
                    <span className="text-sm text-text-secondary">Adiós a los estudios de 3 meses. Datos recolectados y analizados al instante.</span>
                  </div>
                </li>
              </ul>

              <Link to="/b2b" className="btn-secondary px-8 py-3.5 inline-flex font-bold">
                Conocer la plataforma B2B
              </Link>
            </div>

            <div className="lg:w-7/12 w-full">
              {/* Estructura Premium */}
              <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-video bg-white rounded-2xl border border-stroke shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                <div className="h-12 bg-surface2 border-b border-stroke flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 p-6 flex gap-6">
                  <div className="w-64 hidden sm:flex flex-col gap-4">
                    <div className="h-20 bg-surface2 rounded-xl border border-stroke"></div>
                    <div className="h-10 bg-surface2 rounded-xl border border-stroke w-3/4"></div>
                    <div className="h-10 bg-surface2 rounded-xl border border-stroke w-full"></div>
                    <div className="h-10 bg-surface2 rounded-xl border border-stroke w-5/6"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 bg-surface2 rounded-xl border border-stroke flex items-center justify-center">
                        <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
                      </div>
                      <div className="h-24 flex-1 bg-surface2 rounded-xl border border-stroke flex items-center justify-center">
                        <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
                      </div>
                      <div className="h-24 flex-1 bg-surface2 rounded-xl border border-stroke items-center justify-center hidden md:flex">
                        <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-surface2 rounded-xl border border-stroke relative overflow-hidden flex items-end px-8 pb-8 gap-4">
                      <div className="w-12 h-1/2 bg-slate-200 rounded-t-sm"></div>
                      <div className="w-12 h-3/4 bg-primary/40 rounded-t-sm"></div>
                      <div className="w-12 h-full bg-primary rounded-t-sm"></div>
                      <div className="w-12 h-2/3 bg-slate-200 rounded-t-sm"></div>
                      <div className="w-12 h-1/3 bg-slate-200 rounded-t-sm"></div>
                      <div className="absolute inset-x-8 bottom-8 border-b-2 border-dashed border-emerald-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL MOTIVACIONAL */}
      <section className="py-32 bg-surface2 text-center border-t border-stroke">
        <div className="container-ws max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-3xl text-gradient-brand">diversity_2</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-6 leading-[1.1]">
            El futuro de la investigación es <span className="text-gradient-brand">abierto</span>
          </h2>

          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Únete a cientos de miles de chilenos que ya están moldeando el futuro social, político y comercial del país, simplemente compartiendo sus perspectivas.
          </p>

          <Link to={mainCtaPath} className="btn-hero min-w-[280px]">
            {isAuthenticated ? "Emite tu señal" : "Crear cuenta ahora"}
          </Link>

          {!isAuthenticated && (
            <p className="mt-6 text-sm text-text-muted font-medium">
              No requiere tarjeta. Transparencia total de datos.
            </p>
          )}
        </div>
      </section>

      {/* 8. STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-[45] sm:hidden flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-5 duration-500">
        <Link to={mainCtaPath} className="btn-hero w-full max-w-sm py-3.5 text-base shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
          {isAuthenticated ? "Empezar a votar" : "Crear cuenta ahora"}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

    </div>
  );
}
