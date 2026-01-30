import React, { useState } from "react";
import PageShell from "../../../components/layout/PageShell";
import InsightAuto from "../components/InsightAuto";
import Select from "../../../components/ui/Select";
import { motion } from "framer-motion";
import { useDemoData } from "../../../demo/DemoContext";

type Filters = {
  region: "RM" | "Valparaíso" | "Biobío";
  age: "18–24" | "25–34" | "35–44";
  category: "Sociedad" | "Economía" | "Política" | "Trabajo" | "Deportes" | "Productos";
  windowLabel: "24h" | "7 días" | "30 días";
};

const Results: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    region: "RM",
    age: "18–24",
    category: "Sociedad",
    windowLabel: "7 días",
  });

  // DEMO data
  const { stats } = useDemoData();

  const kpis = React.useMemo(() => {
    return {
      sampleN: stats.totalVotes, // Use total votes as "Muestra"
      consensus: 66,
      deltaPts: 1.7,
      volatility: "Media" as const,
      quality: "Alta" as const,
      alert: "Sin alerta" as const,
      drivers: [
        { label: "Experiencia directa", value: 20 },
        { label: "Costo de vida", value: 24 },
        { label: "Medios / redes", value: 11 },
        { label: "Servicios públicos", value: 13 },
        { label: "Expectativas", value: 11 },
      ],
      series: [62.1, 61.9, 61.7, 62.8, 66.1, 64.2, 65.4, 63.1, 62.2, 62.3, 64.0],
    };
  }, [stats]);

  const lastUpdate = React.useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  return (
    <PageShell>
      <div className="min-h-screen bg-app">
        {/* Sub-header */}
        <div className="pt-10 pb-10 px-5 text-center flex flex-col items-center border-b border-stroke bg-card">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 border border-white/10 text-ink text-[10px] font-black tracking-[0.22em] uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Opina+ Intelligence
          </div>

          <h1 className="text-[34px] md:text-[44px] font-black text-ink leading-[0.92] tracking-tight mb-3">
            Analítica{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Profunda.
            </span>
          </h1>

          <p className="text-[14px] md:text-[15px] text-muted max-w-2xl mx-auto leading-relaxed font-semibold mb-5">
            Insights agregados de miles de señales y reseñas. Segmenta por región, edad y categoría para entender el{" "}
            <span className="text-ink font-black">porqué</span>.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.18em]">Última sync:</span>
            <span className="text-[11px] font-mono text-ink font-black">{lastUpdate}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          {/* Filters card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home-2 mb-7 relative z-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
              <Select
                label="Región Geográfica"
                value={filters.region}
                onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value as Filters["region"] }))}
              >
                <option>RM</option>
                <option>Valparaíso</option>
                <option>Biobío</option>
              </Select>

              <Select
                label="Rango Etario"
                value={filters.age}
                onChange={(e) => setFilters((p) => ({ ...p, age: e.target.value as Filters["age"] }))}
              >
                <option>18–24</option>
                <option>25–34</option>
                <option>35–44</option>
              </Select>

              <Select
                label="Categoría de Análisis"
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value as Filters["category"] }))}
              >
                <option>Sociedad</option>
                <option>Economía</option>
                <option>Política</option>
                <option>Trabajo</option>
                <option>Deportes</option>
                <option>Productos</option>
              </Select>

              <Select
                label="Ventana de Tiempo"
                value={filters.windowLabel}
                onChange={(e) => setFilters((p) => ({ ...p, windowLabel: e.target.value as Filters["windowLabel"] }))}
              >
                <option>24h</option>
                <option>7 días</option>
                <option>30 días</option>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/10 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.18em]">Filtros Activos:</span>
                <span className="px-2 py-0.5 bg-white/6 text-ink rounded-lg text-[11px] font-black border border-white/10">
                  {filters.category}
                </span>
                <span className="px-2 py-0.5 bg-white/6 text-ink rounded-lg text-[11px] font-black border border-white/10">
                  {filters.region}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ region: "RM", age: "18–24", category: "Sociedad", windowLabel: "7 días" })}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-black text-muted hover:text-ink hover:bg-white/5 transition-all uppercase tracking-[0.14em] border border-transparent hover:border-white/10"
                >
                  Limpiar
                </button>

                <button className="px-4 py-2 rounded-xl bg-gradient-to-b from-primary/25 to-primary/10 border border-primary/35 text-ink text-[11px] font-black hover:bg-white/8 transition-all shadow-home uppercase tracking-[0.14em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  Actualizar
                </button>
              </div>
            </div>
          </motion.div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home hover:shadow-home-2 transition-all relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-ink relative -right-2 -top-2">groups</span>
              </div>

              <div className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-2">Muestra Total</div>
              <div className="text-[38px] font-black text-ink tracking-tight mb-4">{kpis.sampleN.toLocaleString("es-CL")}</div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2.5 py-1 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-[0.14em] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Alta Calidad
                </div>
                <span className="text-[11px] text-muted font-semibold">Validada por ID</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home hover:shadow-home-2 transition-all relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-ink relative -right-2 -top-2">hub</span>
              </div>

              <div className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-2">Consenso</div>
              <div className="text-[38px] font-black text-ink tracking-tight mb-4">{kpis.consensus}%</div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-ink text-[10px] font-black uppercase tracking-[0.14em] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">show_chart</span>
                  Volatilidad Media
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home hover:shadow-home-2 transition-all relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-ink relative -right-2 -top-2">trending_up</span>
              </div>

              <div className="text-[10px] font-black text-muted uppercase tracking-[0.18em] mb-2">Momentum</div>
              <div className="text-[38px] font-black text-ink tracking-tight mb-4 flex items-center gap-2">
                {kpis.deltaPts > 0 ? "+" : ""}
                {kpis.deltaPts.toFixed(1)} <span className="text-[16px] text-muted font-black">pts</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2.5 py-1 rounded-xl bg-white/6 border border-white/10 text-ink text-[10px] font-black uppercase tracking-[0.14em] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">notifications_none</span>
                  Sin Alertas
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Insight */}
          <div className="mb-7">
            <h3 className="text-[15px] font-black text-ink mb-3 flex items-center gap-2 tracking-tight">
              <span className="material-symbols-outlined text-[18px] text-purple-300">auto_awesome</span>
              Análisis Automático
            </h3>

            <InsightAuto
              region={filters.region}
              age={filters.age}
              category={filters.category}
              windowLabel={filters.windowLabel}
              deltaPts={kpis.deltaPts}
              volatility={kpis.volatility}
              driversTop2={["costo de vida", "servicios públicos"]}
              sampleN={kpis.sampleN}
            />
          </div>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Main Index Chart */}
            <div className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-ink text-[15px] tracking-tight">Índice de Tendencia</h3>
                  <p className="text-[11px] text-muted font-semibold">Evolución temporal del indicador agregado</p>
                </div>
                <button className="text-muted hover:text-ink transition">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>

              <div className="h-72 w-full bg-white/4 rounded-2xl border border-white/10 p-4 relative flex items-end justify-between gap-1 overflow-hidden">
                {/* SVG Chart Line */}
                <div className="absolute inset-0 top-4 bottom-8 left-4 right-4">
                  <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d={(() => {
                        const xs = kpis.series;
                        const min = Math.min(...xs);
                        const max = Math.max(...xs);
                        const W = 600;
                        const H = 240;
                        const xStep = W / (xs.length - 1);
                        const yRange = max - min || 1;
                        const y = (v: number) => H - ((v - min) / yRange) * H;

                        let d = `M 0 ${y(xs[0]).toFixed(1)}`;
                        xs.forEach((v, i) => {
                          const X = i * xStep;
                          d += ` L ${X.toFixed(1)} ${y(v).toFixed(1)}`;
                        });
                        return d;
                      })()}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0 4px 6px rgba(6,182,212,0.2))"
                    />

                    {/* Area fill */}
                    <path
                      d={(() => {
                        const xs = kpis.series;
                        const min = Math.min(...xs);
                        const max = Math.max(...xs);
                        const W = 600;
                        const H = 240;
                        const xStep = W / (xs.length - 1);
                        const yRange = max - min || 1;
                        const y = (v: number) => H - ((v - min) / yRange) * H;

                        let d = `M 0 ${y(xs[0]).toFixed(1)}`;
                        xs.forEach((v, i) => {
                          const X = i * xStep;
                          d += ` L ${X.toFixed(1)} ${y(v).toFixed(1)}`;
                        });
                        d += ` V ${H} H 0 Z`;
                        return d;
                      })()}
                      fill="url(#chartGradient)"
                      stroke="none"
                    />
                  </svg>
                </div>

                {/* X Axis labels */}
                <div className="absolute inset-x-4 bottom-2 flex justify-between text-[10px] font-black text-muted uppercase tracking-[0.22em]">
                  <span>Inicio</span>
                  <span>Medio</span>
                  <span>Hoy</span>
                </div>
              </div>
            </div>

            {/* Drivers Bar Chart */}
            <div className="bg-card-gradient rounded-r2 border border-stroke p-5 shadow-home">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-ink text-[15px] tracking-tight">Drivers de Opinión</h3>
                  <p className="text-[11px] text-muted font-semibold">Factores de mayor impacto en la percepción</p>
                </div>
                <div className="bg-white/6 border border-white/10 text-ink px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.18em]">
                  Top 5
                </div>
              </div>

              <div className="space-y-5">
                {kpis.drivers.map((d, i) => (
                  <div key={d.label} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-black text-muted group-hover:text-ink transition-colors uppercase tracking-tight flex items-center gap-2">
                        <span className="text-white/30 w-3">{i + 1}.</span>
                        {d.label}
                      </div>
                      <div className="text-[12px] font-black text-ink">{d.value}%</div>
                    </div>

                    <div className="h-2.5 rounded-full bg-white/4 border border-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(d.value / 30) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full bg-white/70 group-hover:bg-primary transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 p-4 rounded-2xl bg-white/4 border border-white/10 flex gap-3 items-start">
                <span className="material-symbols-outlined text-white/50 text-lg">info</span>
                <p className="text-[11px] text-muted leading-relaxed font-semibold">
                  Estos factores se calculan cruzando las respuestas cualitativas con la variación del índice principal mediante análisis de sentimiento automatizado.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export default Results;
