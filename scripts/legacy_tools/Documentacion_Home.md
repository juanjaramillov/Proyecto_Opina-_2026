# Documentación Completa: Página Home (Opina+)

Este archivo consolida **todo** lo relacionado a la página Home: la estructura principal, los textos, las descripciones visuales e ilustraciones, y todo el código de cada bloque.

---

## 1. Estructura Principal (`Home.tsx`)

Aquí se orquestan y agrupan todas las secciones que conforman la página principal.

```tsx

import InteractiveHeroSection from "../sections/InteractiveHeroSection";
import LiveTrendsSection from "../sections/LiveTrendsSection";
import ChallengesMenuSection from "../sections/ChallengesMenuSection";
import CommunityPulseSection from "../sections/CommunityPulseSection";
import GamifiedCTASection from "../sections/GamifiedCTASection";
import WhatIsOpinaSection from "../sections/WhatIsOpinaSection";

import RewardsValuePropsSection from "../sections/RewardsValuePropsSection";

export default function Home() {
  return (
    <main className="bg-white text-ink min-h-screen">
      <InteractiveHeroSection />
      <WhatIsOpinaSection />
      <LiveTrendsSection />
      <ChallengesMenuSection />
      <RewardsValuePropsSection />
      <CommunityPulseSection />
      <GamifiedCTASection /> 
    </main>
  );
}

```

---

## 2. Secciones de la Home

### 2.1 Interactive Hero Section

**Textos Principales:**
- "Tus señales construyen esto."
- "Cada decisión suma valor real..."
- "Tu racha diaria está activa"

**Visuales e Ilustraciones:**
- Diseño 3D interactivo con redes satelitales
- Anillos orbitales (glassmorphism) y núcleo brillante
- Etiquetas flotantes con iconos (Versus, Torneos, Actualidad, Productos, Profundidad, Lugares)

**Código (`src/features/home/sections/InteractiveHeroSection.tsx`):**
```tsx
import { Link } from "react-router-dom";

export default function InteractiveHeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Intense but clean light background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white blur-3xl opacity-80" />
        <div className="absolute bottom-0 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* LEFT COMPONENT: Text & CTA */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl z-20 mt-8 lg:mt-0">
            {/* Minimalist Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Señales en vivo
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-ink mb-6 leading-[1.1]">
            Tus señales<br />
            construyen <br />
            <span className="text-blue-600">esto</span><span className="text-emerald-500">.</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-500 mb-8 sm:mb-10 max-w-lg leading-relaxed font-medium">
            Cada decisión suma valor real. Descubre las tendencias y compárate con la comunidad en tiempo real.
            </p>

            <Link 
            to="/signals"
            className="inline-flex items-center gap-2 bg-ink hover:bg-slate-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-transform hover:scale-105 hover:shadow-xl hover:shadow-ink/20 mb-10 sm:mb-12"
            >
            Seguir participando
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>

            {/* Streak Box */}
            <div className="w-full max-w-md bg-orange-50/80 backdrop-blur-sm border border-orange-100/80 rounded-3xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-orange-500">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">local_fire_department</span>
                </div>
                <div>
                    <h4 className="text-orange-900 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">Tu racha diaria está activa</h4>
                    <p className="text-orange-700/80 text-[10px] sm:text-xs font-medium leading-relaxed max-w-[280px]">
                        Aporta 10 señales más hoy para mantener tu racha de crecimiento.
                    </p>
                </div>
            </div>
        </div>

        {/* RIGHT COMPONENT: 3D Illustration EXACTLY as the First Iteration */}
        <div className="flex-1 w-full flex items-center justify-center relative min-h-[350px] sm:min-h-[400px] lg:min-h-[600px] pointer-events-none perspective-1000 mt-8 lg:mt-0">
            
            <div className="flex-col items-center justify-center relative pointer-events-none w-full h-[300px] lg:h-[480px] perspective-1000 -mr-0 lg:-mr-12 scale-90 sm:scale-[1.1] lg:scale-[1.3] transform-origin-center lg:transform-origin-right">
                {/* Red de satélites / conexiones Espaciales */}
                <div className="absolute inset-0 flex items-center justify-center transform-style-3d">
                    {/* Superficie base (Malla de energía) rediseñada MUCHO más sutil y profunda (3D) */}
                    <div 
                        className="absolute w-[150%] h-[150%] bg-[linear-gradient(to_right,#3b82f6_1.5px,transparent_1.5px),linear-gradient(to_bottom,#10b981_1.5px,transparent_1.5px)] bg-[size:50px_50px] opacity-[0.15] animate-[pulse_6s_ease-in-out_infinite]"
                        style={{ 
                            transform: 'rotateX(75deg) rotateZ(-45deg) translateZ(-50px)',
                            maskImage: 'radial-gradient(circle at center, black 5%, transparent 60%)', 
                            WebkitMaskImage: 'radial-gradient(circle at center, black 5%, transparent 60%)' 
                        }}
                    ></div>

                    {/* Anillos orbitales entrelazados */}
                    <div className="absolute w-[80%] h-[80%] max-w-[400px] max-h-[400px] border-[2px] border-primary/20 rounded-full animate-[spin_15s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(15deg)' }}></div>
                    <div className="absolute w-[95%] h-[95%] max-w-[450px] max-h-[450px] border-[1.5px] border-emerald-500/30 rounded-full animate-[spin_20s_linear_infinite_reverse]" style={{ transform: 'rotateX(50deg) rotateY(-20deg)' }}></div>
                    <div className="absolute w-[70%] h-[70%] max-w-[350px] max-h-[350px] border-[2px] border-purple-500/20 rounded-full animate-[spin_10s_linear_infinite]" style={{ transform: 'rotateX(70deg) rotateZ(30deg)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform rotate-45 rotate-x-60 animate-[shimmer_3s_infinite] blur-md mix-blend-overlay"></div>
                    
                    {/* Partículas viajeras MASIVAS */}
                    <div className="absolute w-full h-full">
                        <span className="absolute top-[20%] left-[20%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] blur-[1px] animate-[ping_3s_infinite]"></span>
                        <span className="absolute top-[80%] left-[70%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></span>
                        <span className="absolute top-[30%] right-[30%] w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_20px_#8b5cf6] blur-[2px] animate-[bounce_4s_infinite]"></span>
                        <span className="absolute bottom-[20%] right-[40%] w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] animate-[ping_2s_infinite]"></span>
                        
                        {/* Más puntos simulando señales masivas */}
                        <span className="absolute top-[40%] left-[10%] w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_10px_#93c5fd] animate-[ping_2.5s_infinite]"></span>
                        <span className="absolute bottom-[40%] left-[30%] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#34d399] animate-[bounce_3s_infinite]"></span>
                        <span className="absolute top-[60%] right-[15%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a78bfa] animate-[ping_3.5s_infinite]"></span>
                        <span className="absolute top-[10%] right-[50%] w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_12px_#fde047] blur-[1px] animate-[pulse_2s_infinite]"></span>
                        <span className="absolute bottom-[10%] right-[20%] w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6] animate-[ping_1.5s_infinite]"></span>
                    </div>
                </div>

                {/* Núcleo de Vida (Pulsante e inmersivo) */}
                <div className="relative z-20 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transition-transform duration-700 animate-[bounce_6s_ease-in-out_infinite] mx-auto mt-[20%] lg:mt-[15%]">
                    {/* Resplandores Profundos */}
                    <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3),transparent_70%)] rounded-full blur-3xl animate-[pulse_3s_linear_infinite]"></div>
                    <div className="absolute inset-[-30%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_60%)] rounded-full blur-2xl animate-[ping_5s_linear_infinite]"></div>
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-xl animate-pulse"></div>

                    {/* Esfera Central Glassmorphism Hiper-Premium */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-2xl border border-white/80 shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_2px_10px_rgba(255,255,255,1)] rounded-[2.5rem] flex items-center justify-center overflow-hidden rotate-45 transform-style-3d group-hover:rotate-[40deg] transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-emerald-400/30 animate-[spin_10s_linear_infinite]"></div>
                        {/* Pulso interno 3D con LOGO OPINA+ */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-brand rounded-full shadow-[inset_0_-8px_15px_rgba(0,0,0,0.3),0_10px_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white relative z-10 -rotate-45 transform-style-3d perspective-1000">
                            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
                            <div className="absolute top-1 left-2 w-4 h-4 md:w-6 md:h-6 bg-white/60 rounded-full blur-[4px] mix-blend-overlay"></div>
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md animate-[pulse_2s_ease-in-out_infinite] transform translate-z-10">
                              <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                              <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                              <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Etiquetas de datos flotantes en 3D (Secciones de Opina+) */}
                {/* Versus */}
                <div className="absolute top-[15%] left-[5%] md:left-[15%] bg-white/90 backdrop-blur-xl border border-slate-100 text-ink px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[-5deg] flex items-center gap-1.5 animate-[bounce_4.5s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-blue-500">compare_arrows</span>
                    Versus
                </div>
                
                {/* Torneos */}
                <div className="absolute top-[25%] right-[10%] lg:right-[5%] bg-purple-50/90 backdrop-blur-xl border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-6 flex items-center gap-1.5 animate-[bounce_5.5s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-purple-600">emoji_events</span>
                    Torneos
                </div>

                {/* Actualidad */}
                <div className="absolute top-[50%] left-[5%] lg:left-[2%] bg-pink-50/90 backdrop-blur-xl border border-pink-200 text-pink-800 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[2deg] flex items-center gap-1.5 animate-[bounce_5s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-pink-600">newspaper</span>
                    Actualidad
                </div>

                {/* Productos */}
                <div className="absolute top-[60%] right-[5%] lg:right-[2%] bg-amber-50/90 backdrop-blur-xl border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[-4deg] flex items-center gap-1.5 animate-[bounce_4.8s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-amber-600">category</span>
                    Productos
                </div>

                {/* Profundidad */}
                <div className="absolute bottom-[25%] left-[20%] bg-blue-50/90 backdrop-blur-xl border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[4deg] flex items-center gap-1.5 animate-[bounce_4s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">psychology</span>
                    Profundidad
                </div>

                {/* Lugares */}
                <div className="absolute bottom-[15%] right-[15%] lg:right-[10%] bg-emerald-50/90 backdrop-blur-xl border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[-3deg] flex items-center gap-1.5 animate-[bounce_6s_ease-in-out_infinite] z-40">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">place</span>
                    Lugares
                </div>
            </div>

        </div>

      </div>
    </section>
  );
}

```

---

### 2.2 What Is Opina Section

**Textos Principales:**
- "¿Qué es Opina+?"
- "1. Participa"
- "2. Descubre"
- "3. Gana"

**Visuales e Ilustraciones:**
- Iconos Material Symbols animados (touch_app, donut_small, redeem)
- Cards interactivas con glow effects on hover

**Código (`src/features/home/sections/WhatIsOpinaSection.tsx`):**
```tsx
import { Link } from 'react-router-dom';

export default function WhatIsOpinaSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
      {/* Decoración ambiental sutil */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
            Inteligencia Colectiva
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-ink mb-6 tracking-tight">
            ¿Qué es <span className="text-blue-600">Opina+</span>?
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Una plataforma donde tu voz tiene peso. Aporta tus opiniones, descubre cómo piensa el resto y recibe valor a cambio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Línea conectora (visible en desktop) */}
          <div className="hidden md:block absolute top-[48px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-emerald-100 to-orange-100 z-0" />

          {/* Paso 1 */}
          <Link to="/signals" className="relative z-10 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-blue-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-blue-500 relative z-10 group-hover:scale-110 transition-transform duration-300">touch_app</span>
            </div>
            <div className="bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">1. Participa</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-blue-600 transition-colors">Aporta tus señales</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Responde dinámicas rápidas y entretenidas. Cada voto, cada elección es una señal que suma a la inteligencia colectiva.
            </p>
          </Link>

          {/* Paso 2 */}
          <Link to="/results" className="relative z-10 flex flex-col items-center text-center group mt-4 md:mt-0 cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-emerald-500 relative z-10 group-hover:scale-110 transition-transform duration-300">donut_small</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">2. Descubre</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-emerald-600 transition-colors">Compara y entiende</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Accede a resultados instantáneos. Descubre macro tendencias y compárate con miles de personas en tiempo real.
            </p>
          </Link>

          {/* Paso 3 */}
          <Link to="/profile" className="relative z-10 flex flex-col items-center text-center group mt-4 md:mt-0 cursor-pointer">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-50 flex items-center justify-center mb-8 transform transition-transform group-hover:-translate-y-2 duration-300 relative">
              <div className="absolute inset-0 bg-orange-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-[48px] text-orange-500 relative z-10 group-hover:scale-110 transition-transform duration-300">redeem</span>
            </div>
            <div className="bg-orange-50 text-orange-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">3. Gana</div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-4 group-hover:text-orange-600 transition-colors">Obtén recompensas</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
              Mantén tu racha, sube de nivel y desbloquea beneficios exclusivos por tu aporte constante a la plataforma.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

```

---

### 2.3 Live Trends Section

**Textos Principales:**
- "¡Boom! El pulso de la comunidad."
- "Consenso Destacado"
- "Radar de Tendencias Top"
- "Señales por Categoría"
- "Red Activa"

**Visuales e Ilustraciones:**
- Bento Box Grid layout
- Odómetro interactivo para las señales globales
- Progress bars de categorías
- Iconos Lucide de actividad y estadísticas

**Código (`src/features/home/sections/LiveTrendsSection.tsx`):**
```tsx
import { TrendingUp, Activity, Globe, Sparkles, Users, Flame, Swords, PieChart } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function LiveTrendsSection() {
  const [count, setCount] = useState(24000);
  const odometerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 24000;
        const end = 24821;
        const duration = 2000;
        const increment = (end - start) / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    
    if (odometerRef.current) {
      observer.observe(odometerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const formattedCount = Math.floor(count).toString().split('');

  // Mock data for the new Ranking
  const topConsensus = [
    { rank: 1, name: "Inteligencia Artificial", detail: "94% de acuerdo", isHot: true },
    { rank: 2, name: "Sostenibilidad", detail: "88% de acuerdo", isHot: false },
    { rank: 3, name: "Salud Mental", detail: "85% de acuerdo", isHot: true },
  ];

  const topPolarized = [
    { rank: 1, name: "Economía de Creadores", detail: "51% vs 49%", isHot: true },
    { rank: 2, name: "Trabajo 100% Remoto", detail: "53% vs 47%", isHot: false },
    { rank: 3, name: "Criptomonedas", detail: "55% vs 45%", isHot: false },
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* Subtle background orbs for Glassmorphism effect */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 backdrop-blur-md">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-2">
            ¡Boom! El pulso de la <span className="text-gradient-brand">comunidad</span>.
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Descubre las principales conclusiones, tendencias y preferencias generadas por los votos de todos los usuarios.
          </p>
        </div>

        {/* Bento Box Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1: Consenso Comunitario (Span 1) - Glassmorphism applied */}
          <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl group-hover:bg-indigo-200/60 transition-colors" />
            
            <div className="relative z-10 flex items-center gap-2 text-primary font-bold mb-4">
              <Users className="w-5 h-5" />
              <h3>CONSENSO DESTACADO</h3>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black font-display text-slate-800 tracking-tight">82</span>
                <span className="text-3xl font-black font-display text-primary">%</span>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                De la comunidad cree que el modelo de trabajo híbrido es superior al 100% presencial.
              </p>
            </div>
            
            <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-primary/20 w-fit">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Preferencia dominante
            </div>
          </div>

          {/* Card 2: Ranking de Tendencias (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-6">
              <TrendingUp className="w-5 h-5" />
              <h3>RADAR DE TENDENCIAS TOP</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consenso */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Mayor Consenso
                </h4>
                <div className="space-y-2.5">
                  {topConsensus.map((trend) => (
                    <div key={`cons-${trend.rank}`} className="group relative flex items-center justify-between p-2.5 md:p-3 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          {trend.rank}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {trend.name}
                        </span>
                        {trend.isHot && (
                          <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <PieChart className="w-3 h-3" />
                        {trend.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polarizados */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Más Polarizados
                </h4>
                <div className="space-y-2.5">
                  {topPolarized.map((trend) => (
                    <div key={`pol-${trend.rank}`} className="group relative flex items-center justify-between p-2.5 md:p-3 rounded-2xl border border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold font-display text-sm group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                          {trend.rank}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {trend.name}
                        </span>
                        {trend.isHot && (
                          <span className="hidden xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                        <Swords className="w-3 h-3" />
                        {trend.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2 */}

          {/* Card 3: Participación por Categorías (Span 2) */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between h-full">
             <div className="relative z-10 flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-indigo-500 font-bold">
                 <Activity className="w-5 h-5" />
                 <h3>SEÑALES POR CATEGORÍA</h3>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volumen Hoy</span>
             </div>
             
             <p className="text-sm text-slate-500 font-medium mb-8">
               ¿En qué temas la comunidad está aportando mayor inteligencia colectiva?
             </p>

             <div className="space-y-5 flex-1 flex flex-col justify-center">
                {[
                  { name: 'Consumo & Marcas', percent: 38, color: 'bg-primary' },
                  { name: 'Trabajo & Economía', percent: 27, color: 'bg-emerald-500' },
                  { name: 'Tecnología e IA', percent: 19, color: 'bg-indigo-400' },
                  { name: 'Entretenimiento & Cultura', percent: 16, color: 'bg-amber-400' },
                ].map(cat => (
                  <div key={cat.name} className="flex flex-col gap-2 group cursor-default">
                    <div className="flex justify-between items-end text-xs font-bold text-slate-700">
                      <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                      <span className="text-slate-400">{cat.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${cat.percent}%` }} 
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Card 4: Poder Colectivo (Smaller Widget) */}
          <div ref={odometerRef} className="md:col-span-1 bg-gradient-brand rounded-3xl p-6 border border-transparent shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.25)] transition-shadow relative overflow-hidden flex flex-col justify-between h-full">
             {/* Decorative background shapes */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute -left-10 top-1/2 w-40 h-40 bg-white rounded-full blur-3xl" />
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-400 rounded-full blur-3xl" />
             </div>

             <div className="relative z-10 w-full mb-6">
                <div className="flex items-center gap-2 text-white/90 font-bold uppercase tracking-widest text-[10px]">
                  <Globe className="w-4 h-4" />
                  <span>Red Activa</span>
                </div>
             </div>
             
             <div className="relative z-10 flex-1 flex flex-col justify-center w-full mb-8">
                <div className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">Señales registradas HOY</div>
                {/* Odómetro visual pequeño */}
                <div className="flex items-center gap-0.5 sm:gap-1 w-full justify-center">
                   {formattedCount.map((char, i) => (
                     <div key={`clock-${char}-${i}`} className={`bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg border border-white/20 px-1.5 sm:px-2 py-1 flex items-center justify-center text-xl sm:text-2xl font-black font-display text-white shadow-inner ${char === '.' ? 'bg-transparent border-none w-auto self-end text-lg px-0 pb-0.5' : ''}`}>
                       <span>{char}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="relative z-10 border-t border-white/10 pt-5 mt-auto">
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-indigo-300" />
                        Usuarios Totales
                      </div>
                      <div className="text-white font-bold text-lg font-display">142.5K</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Activos (24h)
                      </div>
                      <div className="text-white font-bold text-lg font-display">18.2K</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-indigo-300" />
                        Señales (Mes)
                      </div>
                      <div className="text-white font-bold text-lg font-display">1.2M</div>
                   </div>
                   <div>
                      <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-indigo-300" />
                        Señales (7d)
                      </div>
                      <div className="text-white font-bold text-lg font-display">345K</div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

```

---

### 2.4 Challenges Menu Section

**Textos Principales:**
- "Aumenta tu impacto"
- "La final de marcas"
- "El debate de la semana"
- "Desbloquea tu lectura"

**Visuales e Ilustraciones:**
- Tres tarjetas con gradientes que responden al mouse
- Iconos Lucide (Trophy, Flame, Search) rotando o ampliándose on-hover

**Código (`src/features/home/sections/ChallengesMenuSection.tsx`):**
```tsx

import { Trophy, Flame, Search, BarChart2, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChallengesMenuSection() {
  const challenges = [
    {
      title: "La final de marcas",
      subtitle: "Torneos",
      icon: <Trophy className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-amber-500 drop-shadow-[0_15px_15px_rgba(251,191,36,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />,
      bgImage: "bg-gradient-to-br from-amber-500/5 to-transparent",
      borderColor: "group-hover:border-amber-500/30",
      link: "/torneos",
      miniData: <><span className="text-primary font-bold">5.2K Señales</span> hoy</>,
      miniIcon: <BarChart2 className="w-4 h-4 text-amber-500" />
    },
    {
      title: "El debate de la semana",
      subtitle: "Actualidad",
      icon: <Flame className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-rose-500 drop-shadow-[0_15px_15px_rgba(244,63,94,0.5)] transform scale-105 group-hover:scale-110 transition-transform duration-500 delay-75" />,
      bgImage: "bg-gradient-to-br from-rose-500/5 to-transparent",
      borderColor: "group-hover:border-rose-500/30",
      link: "/versus",
      miniData: "Creciendo un 45%",
      miniIcon: <TrendingUp className="w-4 h-4 text-rose-500" />
    },
    {
      title: "Desbloquea tu lectura",
      subtitle: "Profundidad",
      icon: <Search className="w-16 h-16 xl:w-20 xl:h-20 mb-6 text-indigo-500 drop-shadow-[0_15px_15px_rgba(99,102,241,0.5)] transform rotate-6 group-hover:rotate-0 transition-transform duration-500 delay-150" />,
      bgImage: "bg-gradient-to-br from-indigo-500/5 to-transparent",
      borderColor: "group-hover:border-indigo-500/30",
      link: "/resultados",
      miniData: "72% para descubrir",
      miniIcon: <Lock className="w-4 h-4 text-indigo-500" />
    }
  ];

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-ink mb-10 text-center md:text-left">
          Aumenta tu impacto. <span className="text-gradient-brand">Suma tus señales a estos versus.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((challenge, idx) => (
            <Link 
              key={idx} 
              to={challenge.link}
              className={`group relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8 pb-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-50/50 flex flex-col items-center text-center justify-between ${challenge.borderColor}`}
            >
              <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${challenge.bgImage}`} />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                {challenge.icon}
                
                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 bg-primary/10 px-3 py-1 rounded-full">
                  {challenge.subtitle}
                </span>
                
                <h3 className="text-2xl font-black text-slate-800 transition-colors mb-6 leading-tight">
                  {challenge.title}
                </h3>
              </div>
              
              <div className="relative z-10 w-full pt-6 border-t border-slate-100 flex items-center justify-center gap-2 group-hover:border-slate-200 transition-colors">
                {challenge.miniIcon}
                <span className="text-slate-500 font-semibold text-sm">
                  {challenge.miniData}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

```

---

### 2.5 Rewards Value Props Section

**Textos Principales:**
- "Valor B2C"
- "Tu opinión es oro. Literalmente."
- "Señales"
- "Radiografías Únicas"
- "Sube tu Rango"

**Visuales e Ilustraciones:**
- Fondo oscuro (stardust) premium
- Secciones de Glassmorphism con halos de colores detrás en hover
- Iconos interactivos Lucide (Coins, Eye, ShieldCheck, Sparkles)

**Código (`src/features/home/sections/RewardsValuePropsSection.tsx`):**
```tsx
import { Coins, Eye, ShieldCheck, Sparkles } from "lucide-react";

export default function RewardsValuePropsSection() {
  const rewards = [
    {
      icon: <Coins className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform duration-500" />,
      title: "Señales",
      description: "Gana valoración por cada interacción. Tus señales tienen peso y recompensa real en nuestro ecosistema.",
      glowColor: "bg-amber-500/20",
      borderColor: "group-hover:border-amber-500/50"
    },
    {
      icon: <Eye className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />,
      title: "Radiografías Únicas",
      description: "Desbloquea datos e insights sociológicos que la mayoría no ve al cruzar la barrera de participación.",
      glowColor: "bg-emerald-500/20",
      borderColor: "group-hover:border-emerald-500/50"
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />,
      title: "Sube tu Rango",
      description: "Pasa de 'Observador' a 'Visionario'. Mientras más colaboras, mayor influencia tiene tu voz en la red.",
      glowColor: "bg-primary/20",
      borderColor: "group-hover:border-primary/50"
    }
  ];

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      
      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 font-bold text-sm mb-6 uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Valor B2C</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Tu opinión es oro. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Literalmente.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium">
            En Opina+ no solo dejas tu huella, construyes tu reputación y desbloqueas beneficios exclusivos por ayudar a mapear la realidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {rewards.map((reward, idx) => (
            <div 
              key={idx}
              className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 overflow-hidden ${reward.borderColor}`}
            >
              {/* Internal Glow Effect on Hover */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${reward.glowColor}`} />
              
              <div className="relative z-10">
                <div className="mb-6">
                  {reward.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{reward.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {reward.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

```

---

### 2.6 Community Pulse Section

**Textos Principales:**
- "Un ecosistema en constante movimiento"
- "Cada señal alimenta la red en tiempo real."
- "Categorías Activas"
- "Comparaciones Hoy"

**Visuales e Ilustraciones:**
- Radar central rotando y emitiendo pulsos
- Cards flotantes anidadas en los bordes simulando nodos de data
- Simulación de señales "luciérnagas" asíncronas con Tooltips (bg-emerald, bg-primary, etc)

**Código (`src/features/home/sections/CommunityPulseSection.tsx`):**
```tsx

import { Radio, GitCommit, Network } from "lucide-react";

export default function CommunityPulseSection() {
  // Mock de señales en vivo, simulando ingesta asíncrona
  const liveSignals = [
    { id: 1, label: "Nueva señal: Streaming", top: "15%", left: "12%", color: "bg-emerald-400", shadow: "shadow-[0_0_15px_rgba(52,211,153,0.6)]", delay: "delay-100", size: "w-3 h-3" },
    { id: 2, label: "Comparación: Apple vs Samsung", top: "25%", right: "18%", color: "bg-primary", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.6)]", delay: "delay-500", size: "w-2.5 h-2.5" },
    { id: 3, label: "Señal anónima (Santiago)", top: "55%", left: "8%", color: "bg-indigo-400", shadow: "shadow-[0_0_15px_rgba(129,140,248,0.6)]", delay: "delay-300", size: "w-2 h-2" },
    { id: 4, label: "Nueva categoría desbloqueada", top: "65%", right: "12%", color: "bg-emerald-500", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.6)]", delay: "delay-700", size: "w-3.5 h-3.5" },
    { id: 5, label: "Participación en Deportes", bottom: "15%", left: "25%", color: "bg-cyan-400", shadow: "shadow-[0_0_15px_rgba(34,211,238,0.6)]", delay: "delay-1000", size: "w-2.5 h-2.5" },
    { id: 6, label: "Señal de Alto Impacto", bottom: "25%", right: "30%", color: "bg-primary", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.6)]", delay: "delay-150", size: "w-4 h-4" },
    { id: 7, label: "Tendencia: Movilidad", top: "40%", right: "8%", color: "bg-indigo-300", shadow: "shadow-[0_0_12px_rgba(165,180,252,0.6)]", delay: "delay-200", size: "w-2 h-2" },
    { id: 8, label: "Nuevo usuario anónimo", bottom: "35%", left: "15%", color: "bg-emerald-300", shadow: "shadow-[0_0_12px_rgba(110,231,183,0.6)]", delay: "delay-1000", size: "w-3 h-3" },
  ];

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 overflow-hidden flex flex-col items-center">
      
      {/* Blueprint / Network faint background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px', color: '#000' }} />

      <div className="relative z-10 text-center mb-16 max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-black text-ink mb-4 tracking-tight">
          Un ecosistema en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">constante movimiento</span>
        </h2>
        <p className="text-xl text-slate-500 font-medium">Cada señal alimenta la red en tiempo real.</p>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[500px] flex items-center justify-center">
         
         {/* Central Radar Illustration */}
         <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-indigo-100 flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.15)] bg-white group">
            {/* The Heartbeat Ping Ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />

            <div className="absolute inset-2 rounded-full border border-emerald-100/50" />
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            <div className="absolute inset-16 rounded-full border border-indigo-200/30 bg-indigo-50/30" />
            
            {/* Spinning radar sweep */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(99,102,241,0.1)_90%,rgba(16,185,129,0.4)_100%)] animate-[spin_4s_linear_infinite]" />
            
            <div className="relative z-20 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 border border-slate-100">
               <Radio className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
         </div>

         {/* Floating Static Cards */}
         
         {/* Node 1: Top Left */}
         <div className="absolute top-0 md:top-10 left-[2%] md:left-[20%] scale-75 sm:scale-90 md:scale-100 origin-top-left group hover:z-50">
            {/* Connection Line Pseudo */}
            <div className="hidden md:block absolute top-1/2 left-full w-32 h-px bg-gradient-to-r from-indigo-200 to-transparent -rotate-12 transform origin-left" />
            
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default relative z-10">
               <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500">
                  <Network className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1">18</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categorías Activas</div>
               </div>
            </div>
         </div>

         {/* Node 2: Bottom Right */}
         <div className="absolute bottom-0 md:bottom-10 right-[2%] md:right-[20%] scale-75 sm:scale-90 md:scale-100 origin-bottom-right group hover:z-50">
             {/* Connection Line Pseudo */}
            <div className="hidden md:block absolute bottom-1/2 right-full w-32 h-px bg-gradient-to-l from-emerald-200 to-transparent -rotate-12 transform origin-right" />

            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default relative z-10">
               <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
                  <GitCommit className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1 flex items-center gap-2">
                    126 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comparaciones Hoy</div>
               </div>
            </div>
         </div>
         
         {/* Signals (Fireflies) */}
         {liveSignals.map((signal) => (
           <div 
             key={signal.id} 
             className="absolute group z-10 hover:z-50 cursor-crosshair p-2 -m-2" /* Aumentar área de click/hover */
             style={{ 
               top: signal.top, 
               left: signal.left, 
               right: signal.right, 
               bottom: signal.bottom 
             }}
           >
             {/* El punto brillante */}
             <div className={`${signal.size} rounded-full ${signal.color} ${signal.shadow} animate-pulse ${signal.delay} group-hover:scale-150 transition-transform duration-300 group-hover:animate-none`} />
             
             {/* Tooltip on Hover */}
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700/50">
               {signal.label}
               {/* Triángulo del tooltip */}
               <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
             </div>
           </div>
         ))}

      </div>
    </section>
  );
}

```

---

### 2.7 Gamified CTA Section

**Textos Principales:**
- "No pierdas tu impacto."
- "Guarda tus señales gratis"

**Visuales e Ilustraciones:**
- Teléfono móvil creado con puro CSS (notch, shadow)
- Barras de datos animadas renderizándose dentro de la "pantalla"
- Elementos interactivos flotantes saltando afuera del móvil
- Botón de "Guardar Señales" estilo shiny animate shimmer

**Código (`src/features/home/sections/GamifiedCTASection.tsx`):**
```tsx
import { BarChart3, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GamifiedCTASection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 w-full">
           {/* Left: Device Illustration */}
           <div className="w-full md:w-1/2 flex justify-center relative">
             
             {/* Main Phone */}
             <div className="relative z-10 w-64 h-[28rem] bg-white rounded-[3rem] border-8 border-slate-800 shadow-2xl flex flex-col overflow-hidden transform -rotate-6 hover:rotate-0 transition-transform duration-700">
               {/* Notch */}
               <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-24 h-full bg-slate-800 rounded-b-xl" />
               </div>
               {/* Screen Content */}
               <div className="flex-1 bg-slate-50 p-6 pt-12 flex flex-col gap-4">
                  {/* Dummy bars */}
                  <div className="w-full h-12 bg-indigo-100 rounded-xl animate-pulse" />
                  <div className="w-3/4 h-12 bg-cyan-100 rounded-xl animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-5/6 h-12 bg-emerald-100 rounded-xl animate-pulse" style={{ animationDelay: '300ms' }} />
               </div>
               {/* Bottom bar */}
               <div className="h-2 w-1/3 bg-slate-300 rounded-full mx-auto mb-2" />
             </div>

             {/* Floating elements popping out */}
             <div className="absolute top-10 -right-4 md:-right-8 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-[bounce_4s_ease-in-out_infinite]">
                <BarChart3 className="w-10 h-10 text-primary" />
             </div>
             <div className="absolute bottom-20 -left-6 md:-left-12 z-20 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 animate-[bounce_5s_ease-in-out_infinite_reverse]">
                <TrendingUp className="w-8 h-8 text-cyan-500" />
             </div>
             <div className="absolute -top-6 left-10 z-0 opacity-60 animate-[pulse_3s_ease-in-out_infinite]">
                <Sparkles className="w-12 h-12 text-amber-400" />
             </div>

           </div>

           {/* Right: Text & CTA */}
           <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 tracking-tight leading-tight">
                No pierdas tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500 hover:tracking-widest transition-all duration-300">impacto</span>.
              </h2>
              <p className="text-xl text-slate-500 font-medium mb-10 max-w-lg">
                Tu historial te define. Guarda tus <span className="font-bold text-primary">señales</span> y compárate con la comunidad Opina+.
              </p>

              <Link 
               to="/wizard/welcome"
               className="group relative inline-flex items-center justify-center gap-3 px-8 mx-auto md:mx-0 py-5 bg-ink text-white rounded-full font-bold text-lg md:text-xl transition-all duration-300 hover:scale-105 hover:bg-slate-800 shadow-2xl shadow-ink/20 overflow-hidden"
             >
               {/* Button Shine Effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
               
               <span className="relative z-10">Guarda tus <span className="text-primary">señales</span> gratis</span>
               <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
        </div>

      </div>
    </section>
  );
}

```

---

