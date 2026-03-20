import { Scale } from "lucide-react";

export function VersusHubSection() {
  return (
    <section className="w-full px-4 md:px-0">
      <div className="w-full py-20 bg-slate-900 border border-slate-800 text-white relative overflow-hidden rounded-[2.5rem] my-8 shadow-2xl mx-auto max-w-[1400px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-6">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-balance">El pulso del sistema binario</h3>
          <p className="text-slate-400 text-lg max-w-2xl font-medium text-balance">
             Visualización profunda de dilemas y confrontaciones activas en la comunidad.
          </p>
        </div>
      </div>
    </section>
  );
}
