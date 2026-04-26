import { BarChart3, TrendingUp, Sparkles, Globe, Flame } from "lucide-react";
import { GradientCTA, GradientText } from "../../../components/ui/foundation";

export default function InteractiveHeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-8 lg:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* LEFT COMPONENT: Text & CTA */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl z-20 mt-8 lg:mt-0">
            {/* Minimalist Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Inteligencia Colectiva en Tiempo Real
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-ink mb-6 leading-[1.1]">
            Tu opinión es una<br />
            <GradientText>señal.</GradientText>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-500 mb-8 sm:mb-10 max-w-lg leading-relaxed font-medium">
            Participa, compara posiciones, sube de nivel y descubre en qué dirección giran las grandes tendencias.
            </p>

            <GradientCTA
              label="Explorar Señales"
              icon="arrow_forward"
              iconPosition="trailing"
              size="lg"
              to="/signals"
              className="mb-10 sm:mb-12 hover:shadow-xl hover:shadow-brand/20"
            />

            {/* Credibility / B2C Box without fake login state */}
            <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shrink-0 shadow-sm text-brand-500">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">verified_user</span>
                </div>
                <div>
                    <h4 className="text-slate-900 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">Evalúa de forma anónima</h4>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium leading-relaxed max-w-[280px]">
                        Opina+ utiliza segmentación estructural para proteger tu identidad mientras validas productos reales.
                    </p>
                </div>
            </div>
        </div>

        {/* RIGHT COMPONENT: Phone Mockup */}
        <div className="flex-1 w-full flex items-center justify-center relative min-h-[350px] sm:min-h-[400px] lg:min-h-[600px] mt-8 lg:mt-0">
           <div className="w-full flex justify-center relative scale-[1.05] sm:scale-125 lg:scale-125 transform-origin-center lg:transform-origin-right">
             {/* Main Phone */}
             <div className="relative z-10 w-64 h-[28rem] bg-white rounded-[3rem] border-8 border-slate-800 shadow-2xl flex flex-col overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-700">
               {/* Notch */}
               <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-24 h-full bg-slate-800 rounded-b-xl" />
               </div>
               {/* Screen Content - Opina+ App Branded Mockup Premium */}
               <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
                  
                  {/* Dynamic Glowing Background Orbs */}
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand/10 blur-[50px] rounded-full mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite]" />
                  <div className="absolute bottom-10 -left-10 w-48 h-48 bg-accent-400/20 blur-[50px] rounded-full mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite_reverse]" />
                  <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/10 blur-[40px] rounded-full mix-blend-multiply" />

                  {/* Header Premium Glassmorphism */}
                  <div className="pt-10 pb-3 px-4 bg-white/60 backdrop-blur-xl border-b border-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center justify-between relative z-20">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-[0_4px_10px_rgba(16,185,129,0.3)] shrink-0">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[14px] h-[14px]">
                          <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                          <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                          <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-black tracking-tight text-slate-900 leading-none">Opina<span className="text-brand">+</span></span>
                          <span className="relative flex h-1.5 w-1.5 ml-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                          </span>
                        </div>
                        <span className="text-[7px] font-semibold text-slate-500 leading-none mt-0.5 uppercase tracking-wide">Live Dashboard</span>
                      </div>
                    </div>
                    
                    {/* User Profile Info */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-white to-slate-50 pl-2 pr-1 py-1 rounded-full border border-slate-200 shadow-sm">
                       <div className="flex flex-col text-right">
                         <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Platino</span>
                         <span className="text-[8px] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">4,250 XP</span>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                          <img src="https://i.pravatar.cc/100?img=33" alt="Avatar" className="w-full h-full object-cover" />
                       </div>
                    </div>
                  </div>

                  {/* Feed Content */}
                  <div className="flex-1 px-3 py-4 flex flex-col gap-3 relative z-10 overflow-hidden">
                    
                    {/* Tarjeta Versús Premium */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/80 flex flex-col gap-3 relative group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.1)] transition-all duration-500">
                       
                       {/* Shimmer Effect */}
                       <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-0 rounded-2xl" />

                       <div className="flex justify-between items-start relative z-10">
                         <div className="flex gap-1 items-center">
                             <span className="px-2 py-1 bg-gradient-to-br from-brand to-accent text-white font-black tracking-widest uppercase text-[6px] rounded-md shadow-[0_2px_10px_rgba(16,185,129,0.3)] flex items-center gap-1 w-max">
                                <Flame className="w-2.5 h-2.5" /> TENDENCIA GLOBAL
                             </span>
                             <span className="text-[6px] font-bold text-slate-500 bg-white/90 shadow-sm border border-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">#Tech & IA</span>
                         </div>
                         <div className="flex -space-x-1.5">
                            <img src="https://i.pravatar.cc/100?img=11" className="w-4 h-4 rounded-full border border-white shadow-sm" />
                            <img src="https://i.pravatar.cc/100?img=5" className="w-4 h-4 rounded-full border border-white shadow-sm" />
                            <div className="w-4 h-4 rounded-full border border-white shadow-sm bg-slate-50 flex items-center justify-center text-[5px] font-bold text-slate-600">+45k</div>
                         </div>
                       </div>
                       
                       <h4 className="text-[12px] font-black text-slate-800 leading-snug relative z-10">
                         ¿La Inteligencia Artificial reemplazará la toma de decisiones estratégicas de los CEOs en 2030?
                       </h4>
                       
                       {/* Opciones Interactivas con nuevo diseño */}
                       <div className="flex gap-2 mt-1 relative z-10">
                          {/* Botón VS Central animado */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                             <span className="text-[7px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-600 italic">VS</span>
                             {/* Anillos de pulso */}
                             <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-30"></div>
                          </div>
                          
                          {/* Opción 1 */}
                          <div className="flex-1 bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                             <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center mb-0.5">
                               <span className="text-sm">🤖</span>
                             </div>
                             <span className="text-[6.5px] font-bold text-slate-600 uppercase tracking-widest">Reemplazo Total</span>
                          </div>
                          
                          {/* Opción 2 - Seleccionada/Destacada */}
                          <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border-none rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.4)] transition-all transform scale-[1.03] origin-right">
                             {/* Borde brillante */}
                             <div className="absolute inset-[1px] rounded-[11px] bg-slate-900 border border-white/10 z-0"></div>
                             <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-brand/30 blur-md z-0 opacity-50"></div>
                             
                             <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-0.5 relative z-10">
                               <span className="text-sm drop-shadow-lg">🧠</span>
                             </div>
                             <span className="text-[6.5px] font-bold text-accent-400 uppercase tracking-widest relative z-10 flex items-center gap-0.5">
                               <svg className="w-2 h-2 text-accent-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                               Súper-Copiloto
                             </span>
                          </div>
                       </div>
                    </div>

                    {/* Results Mini-Card Corporate */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[1.25rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80 flex flex-col gap-3 relative translate-y-1 group-hover:translate-y-0 opacity-95 group-hover:opacity-100 transition-all duration-500 delay-75">
                       <div className="flex justify-between items-end mb-1">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Consenso Actual</span>
                            <span className="text-[11px] font-black text-slate-800">Súper-Copiloto</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent leading-none drop-shadow-sm">82%</span>
                             <span className="text-[6px] text-accent font-bold uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                               <TrendingUp className="w-2 h-2" /> +4% hoy
                             </span>
                          </div>
                       </div>
                       
                       {/* Animated Progress Bar Compleja */}
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative flex">
                          <div className="h-full w-[82%] bg-gradient-to-br from-brand to-accent rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] relative">
                            {/* Reflexión */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-full"></div>
                          </div>
                          <div className="h-full w-[18%] bg-accent-50/50 rounded-r-full"></div>
                       </div>
                    </div>
                  </div>

                  {/* Bottom Nav Premium Mac-like Dock */}
                  <div className="absolute bottom-4 left-4 right-4 h-14 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white flex items-center justify-around px-2 z-30 isolate">
                     {/* Indicador de pestaña seleccionada */}
                     <div className="absolute left-[8%] w-12 h-10 bg-slate-100/80 rounded-xl -z-10 shadow-inner"></div>

                     <div className="flex flex-col items-center gap-1 text-brand cursor-pointer w-12 transform scale-110">
                        <BarChart3 className="w-5 h-5 drop-shadow-sm" />
                        <span className="text-[6px] font-black uppercase tracking-wider">Señales</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer w-12 hover:text-accent transition-colors hover:-translate-y-1">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-[6px] font-bold uppercase tracking-wider">Insights</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer w-12 hover:text-accent transition-colors hover:-translate-y-1">
                        <Globe className="w-5 h-5" />
                        <span className="text-[6px] font-bold uppercase tracking-wider">Ránking</span>
                     </div>
                  </div>
               </div>
               
               {/* Physical Phone Bottom bar indicator */}
               <div className="h-1.5 w-1/3 bg-slate-200 rounded-full mx-auto my-2 shrink-0 z-30 shadow-inner block relative" />
             </div>

             {/* Floating elements popping out - 3D Claymorphism Premium */}
             <div className="absolute top-10 -right-4 md:-right-8 z-30 bg-gradient-to-br from-white to-slate-50 p-4 rounded-2xl shadow-[inset_0_-8px_16px_rgba(0,0,0,0.06),_inset_0_4px_8px_rgba(255,255,255,1),_0_20px_40px_rgba(37,99,235,0.15)] border-t-2 border-white animate-[bounce_4s_ease-in-out_infinite] flex items-center justify-center transform hover:scale-110 transition-transform cursor-default">
                <BarChart3 className="w-9 h-9 text-brand drop-shadow-[0_4px_8px_rgba(37,99,235,0.4)]" />
             </div>
             <div className="absolute bottom-20 -left-6 md:-left-12 z-30 bg-gradient-to-br from-white to-slate-50 p-3.5 rounded-2xl shadow-[inset_0_-8px_16px_rgba(0,0,0,0.06),_inset_0_4px_8px_rgba(255,255,255,1),_0_20px_40px_rgba(16,185,129,0.15)] border-t-2 border-white animate-[bounce_5s_ease-in-out_infinite_reverse] flex items-center justify-center transform hover:scale-110 transition-transform cursor-default">
                <TrendingUp className="w-8 h-8 text-accent drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)]" />
             </div>
             
             {/* Destello Premium */}
             <div className="absolute -top-4 left-10 z-0 opacity-80 animate-[pulse_3s_ease-in-out_infinite] drop-shadow-2xl">
                <Sparkles className="w-10 h-10 text-accent" />
             </div>
           </div>
        </div>

      </div>
    </section>
  );
}
