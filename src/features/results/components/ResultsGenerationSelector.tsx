import { Users } from "lucide-react";
import { ResultsGeneration } from "../hooks/useResultsExperience";

interface Props {
  activeGeneration: ResultsGeneration;
  onGenerationChange: (gen: ResultsGeneration) => void;
}

export function ResultsGenerationSelector({ activeGeneration, onGenerationChange }: Props) {
  const generations = [
    { id: "ALL", label: "Todas", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "GEN_Z", label: "Zeta (1997-2012)", icon: <span className="font-bold text-[10px] tracking-tighter">Z</span> },
    { id: "MILLENNIALS", label: "Millennial (1981-1996)", icon: <span className="font-bold text-[10px] tracking-tighter">M</span> },
    { id: "GEN_X", label: "X (1965-1980)", icon: <span className="font-bold text-[10px] tracking-tighter">X</span> },
    { id: "BOOMERS", label: "Baby Boomer (1946-1964)", icon: <span className="font-bold text-[10px] tracking-tighter">BB</span> }
  ];

  return (
    <div className="w-full flex justify-center py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/50">
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar px-4 w-full max-w-5xl">
        <span className="text-sm font-bold text-slate-800 shrink-0 mr-2 hidden sm:block">Generación:</span>
        {generations.map(gen => {
          const isActive = activeGeneration === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onGenerationChange(gen.id as ResultsGeneration)}
              className={`
                shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all
                ${isActive 
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" 
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700"}
              `}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                {gen.icon}
              </div>
              {gen.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
