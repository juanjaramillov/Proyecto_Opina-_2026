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

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-ink mb-6 leading-[1.1]">
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
            
            <div className="flex-col items-center justify-center relative pointer-events-none w-full h-[300px] lg:h-[480px] perspective-1000 -mr-0 lg:-mr-12 scale-[1.1] lg:scale-[1.3] transform-origin-center lg:transform-origin-right">
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
                <div className="absolute top-[15%] left-[15%] bg-white/90 backdrop-blur-xl border border-slate-100 text-ink px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg transform rotate-[-5deg] flex items-center gap-1.5 animate-[bounce_4.5s_ease-in-out_infinite] z-40">
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
