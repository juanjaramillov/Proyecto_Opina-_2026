
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResultsWowClosing = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-20 bg-brand-primary text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <Sparkles className="w-12 h-12 text-white/50 mx-auto mb-6" />
        
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          La opinión ciudadana <br className="hidden md:block" />
          es un mapa en movimiento.
        </h2>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Sigue explorando señales, evalúa nuevas marcas y ayuda a construir el ecosistema en tiempo real.
        </p>
        
        <button 
          onClick={() => navigate('/signals')}
          className="inline-flex items-center justify-center bg-white text-brand-primary hover:bg-slate-50 font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105"
        >
          Explorar Señales <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
