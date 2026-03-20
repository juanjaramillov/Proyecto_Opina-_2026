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
