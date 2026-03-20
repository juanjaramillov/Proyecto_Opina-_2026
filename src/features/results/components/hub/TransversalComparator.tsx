import { ResultsModule, ResultsPeriod } from "./FilterBar";
import { User, Users, MoveRight } from "lucide-react";

interface TransversalComparatorProps {
  activeModule: ResultsModule;
  activePeriod: ResultsPeriod;
}

export function TransversalComparator({ activeModule, activePeriod }: TransversalComparatorProps) {
  
  const getComparisonData = () => {
    if (activeModule === "ALL") {
      return {
        conclusion: "Estás dentro del consenso general.",
        tu: { label: "Alineación", value: "72%", desc: "Tu postura refleja la tendencia dominante del ecosistema." },
        comunidad: { label: "Alineación", value: "68%", desc: "El ecosistema mantiene una postura moderadamente estable." }
      };
    }
    
    // Simplificado para otros módulos
    return {
      conclusion: "Tu postura es más radical que el promedio.",
      tu: { label: "Fricción", value: "85%", desc: "Tus respuestas tienden a los extremos en este tema." },
      comunidad: { label: "Fricción", value: "45%", desc: "La comunidad mantiene una postura mucho más neutral." }
    };
  }

  const data = getComparisonData();
  
  return (
    <section className="w-full bg-slate-50 py-16 md:py-24 border-y border-slate-200">
      <div className="container-ws">
        
        {/* Editorial Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-ink pb-8">
          <div className="max-w-3xl">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">
              {activeModule === "ALL" ? "Tu Huella" : `${activeModule} vs Tú`} — {activePeriod}
            </h2>
            <p className="text-4xl md:text-6xl font-black text-ink tracking-tighter leading-none text-balance">
              {data.conclusion}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-2 border-ink text-ink">
            <MoveRight className="w-8 h-8" />
          </div>
        </div>

        {/* 50/50 Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 rounded-[2rem] overflow-hidden shadow-xl border border-slate-200">
          
          {/* TÚ */}
          <div className="bg-white p-10 md:p-16 flex flex-col justify-between group hover:bg-emerald-50 transition-colors duration-500">
            <div className="flex justify-between items-start mb-16">
              <h3 className="text-3xl md:text-4xl font-black text-ink tracking-tight flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                Tú
              </h3>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {data.tu.label}
              </span>
            </div>
            
            <div>
              <div className="text-[5rem] md:text-[8rem] font-black text-emerald-600 tracking-tighter leading-[0.8] mb-6 drop-shadow-sm group-hover:scale-105 transition-transform duration-500 origin-left">
                {data.tu.value}
              </div>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-sm">
                {data.tu.desc}
              </p>
            </div>
          </div>

          {/* LA COMUNIDAD */}
          <div className="bg-slate-100 p-10 md:p-16 flex flex-col justify-between group hover:bg-white transition-colors duration-500">
            <div className="flex justify-between items-start mb-16">
              <h3 className="text-3xl md:text-4xl font-black text-ink tracking-tight flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                La Comunidad
              </h3>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {data.comunidad.label}
              </span>
            </div>
            
            <div>
              <div className="text-[5rem] md:text-[8rem] font-black text-slate-300 tracking-tighter leading-[0.8] mb-6 drop-shadow-sm group-hover:text-blue-600 transition-colors duration-500">
                {data.comunidad.value}
              </div>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-sm">
                {data.comunidad.desc}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
