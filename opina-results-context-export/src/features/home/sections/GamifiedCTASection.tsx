import { BarChart3, TrendingUp, Sparkles, ArrowRight, Users, Globe, Flame } from "lucide-react";
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
               {/* Screen Content - Opina+ App Branded Mockup */}
               <div className="flex-1 bg-slate-50 p-3 pt-10 flex flex-col gap-2.5 relative overflow-hidden">
                  
                  {/* Decorative corporate blur inside screen */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-tr from-primary/20 to-emerald-400/20 blur-2xl rounded-full" />

                  {/* Header Brandeado */}
                  <div className="flex items-center justify-between mb-1 relative z-10">
                    <div className="flex items-center gap-1.5">
                      {/* Logo Opina+ Miniatura */}
                      <div className="h-5 w-5 rounded-[0.4rem] bg-gradient-brand flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.25)] shrink-0">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
                          <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                          <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                          <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black tracking-tight text-slate-900 leading-none">Opina<span className="text-primary">+</span></span>
                    </div>
                    
                    {/* Usuario & XP */}
                    <div className="flex items-center gap-2">
                       <div className="flex flex-col text-right">
                         <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Nivel 4</span>
                         <span className="text-[7px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">1,200 XP</span>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                       </div>
                    </div>
                  </div>

                  {/* Tarjeta Versús Brandeada */}
                  <div className="bg-white rounded-[1rem] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-2 relative z-10 group/mockup">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-primary to-cyan-500 text-white font-black tracking-widest uppercase text-[5px] rounded border border-white/20 shadow-sm flex items-center gap-1">
                           <Flame className="w-2 h-2" /> Señal Activa
                        </span>
                     </div>
                     <h4 className="text-[10px] font-bold text-slate-800 leading-snug">
                       ¿El futuro es el modelo de trabajo 100% remoto o híbrido?
                     </h4>
                     
                     {/* Botones Estilo Opina+ */}
                     <div className="flex gap-2 mt-2">
                        <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 shadow-sm">
                           <span className="text-xs">🏠</span>
                           <span className="text-[6px] font-bold text-slate-500 uppercase">100% Remoto</span>
                        </div>
                        <div className="flex-1 bg-slate-800 border-2 border-primary rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                           <span className="text-xs">🏢</span>
                           <span className="text-[6px] font-bold text-white uppercase">Híbrido</span>
                        </div>
                     </div>
                  </div>

                  {/* Results Mini-Card Corporate */}
                  <div className="bg-white rounded-[1rem] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-2 relative z-10">
                     <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Consenso Global</span>
                        <span className="text-[9px] font-black text-primary">82%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="w-[82%] h-full bg-gradient-to-r from-primary via-cyan-500 to-emerald-400 rounded-full" />
                     </div>
                  </div>

                  {/* Bottom Nav Brandeada */}
                  <div className="absolute bottom-5 left-4 right-4 h-11 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white flex items-center justify-around px-2 z-20">
                     <div className="flex flex-col items-center gap-1 text-primary">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-[5px] font-black uppercase tracking-wider">Señales</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-500 transition-colors">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[5px] font-bold uppercase tracking-wider">Resultados</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Globe className="w-4 h-4" />
                        <span className="text-[5px] font-bold uppercase tracking-wider">Comunidad</span>
                     </div>
                  </div>
               </div>
               {/* Physical Phone Bottom bar indicator */}
               <div className="h-1.5 w-1/3 bg-slate-300 rounded-full mx-auto my-2 shrink-0 z-30" />
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
