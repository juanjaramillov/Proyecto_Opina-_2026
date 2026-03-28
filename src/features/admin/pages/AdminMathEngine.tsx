import { useState } from "react";
import { Calculator, Clock, BarChart2, Activity } from "lucide-react";
import { mathEngineService } from "../services/mathEngineService";
import { Link } from "react-router-dom";

export default function AdminMathEngine() {
  const [activeTab, setActiveTab] = useState<"decay" | "wilson" | "entropy">("decay");

  // State: Time Decay
  const [decayDays, setDecayDays] = useState(15);
  const [halfLife, setHalfLife] = useState(30);
  const [decayResult, setDecayResult] = useState<number | null>(null);

  // State: Wilson Score
  const [posVotes, setPosVotes] = useState(1);
  const [totVotes, setTotVotes] = useState(1);
  const [wilsonResult, setWilsonResult] = useState<number | null>(null);

  // State: Shannon Entropy
  const [entropyShares, setEntropyShares] = useState<string>("0.5, 0.5");
  const [entropyResult, setEntropyResult] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTimeDecay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mathEngineService.simulateTimeDecay(decayDays, halfLife);
      setDecayResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al simular Time Decay");
      }
    } finally {
      setLoading(false);
    }
  };

  const testWilsonScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = Math.max(0, parseInt(posVotes.toString()) || 0);
      const t = Math.max(1, parseInt(totVotes.toString()) || 1);
      const res = await mathEngineService.simulateWilsonScore(p, Math.max(p, t));
      setWilsonResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al simular Wilson Score");
      }
    } finally {
      setLoading(false);
    }
  };

  const testEntropy = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedShares = entropyShares
        .split(",")
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n) && n > 0);
        
      if (parsedShares.length === 0) throw new Error("Format inválido o vacío.");
      
      const res = await mathEngineService.simulateShannonEntropy(parsedShares);
      setEntropyResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al simular Entropía");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-purple-600" />
            <span className="text-gradient-brand">Motor Estadístico</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Auditoría en vivo de las fórmulas matemáticas nativas de la base de datos (Canonical Analytics).
          </p>
        </div>
        <Link 
          to="/admin/system"
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          Volver a System Overview
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("decay")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "decay" ? "bg-purple-100 text-purple-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Clock className="w-4 h-4" />
          Time Decay (Vida Media)
        </button>
        <button
          onClick={() => setActiveTab("wilson")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "wilson" ? "bg-purple-100 text-purple-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <BarChart2 className="w-4 h-4" />
          Wilson Score Interval
        </button>
        <button
          onClick={() => setActiveTab("entropy")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "entropy" ? "bg-purple-100 text-purple-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Activity className="w-4 h-4" />
          Entropía de Shannon
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Lab Area */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-4xl">
        
        {/* TIME DECAY TAB */}
        {activeTab === "decay" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Calculadora de Time Decay</h2>
              <p className="text-slate-500 text-sm mt-1">Simula cómo se devalúa el peso de un voto a lo largo de los días mediante decaimiento exponencial.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Antigüedad del voto (días): {decayDays}</label>
                <input 
                  type="range" min="0" max="180" 
                  value={decayDays} onChange={(e) => setDecayDays(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Constante de Vida Media (días): {halfLife}</label>
                <select 
                  value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value={7}>7 días (Muy rápido)</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días (Recomendado Opina+)</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>
            </div>

            <button 
              onClick={testTimeDecay} disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Simular Decaimiento
            </button>

            {decayResult !== null && (
              <div className="mt-8 p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                <p className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Peso Estadístico Resultante</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-purple-900">{(decayResult * 100).toFixed(2)}%</span>
                  <span className="text-purple-700 font-medium mb-2">del valor original ({decayResult} factor)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WILSON SCORE TAB */}
        {activeTab === "wilson" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Calculadora de Wilson Score</h2>
              <p className="text-slate-500 text-sm mt-1">Calcula el margen inferior real para ratios (evita que un 1/1 gane a un 90/100).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Señales Positivas a Favor</label>
                <input 
                  type="number" min="0" 
                  value={posVotes} onChange={(e) => setPosVotes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Señales Totales Emitidas (Positivas + Negativos/Skips)</label>
                <input 
                  type="number" min="1" 
                  value={totVotes} onChange={(e) => setTotVotes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button 
              onClick={testWilsonScore} disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Simular Win/Loss Margin (Wilson)
            </button>

            {wilsonResult !== null && (
              <div className="mt-8 p-6 bg-purple-50 border border-purple-100 rounded-2xl flex flex-col gap-4">
                <div>
                  <p className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Score Crudo Tradicional (Engañoso)</p>
                  <span className="text-3xl font-black text-slate-400">{((posVotes / Math.max(1, totVotes)) * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full h-px bg-purple-200"></div>
                <div>
                  <p className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Score Real Inferior (Wilson)</p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-purple-900">{(wilsonResult * 100).toFixed(2)}%</span>
                    <span className="text-purple-700 font-medium mb-2">Score suavizado seguro ({wilsonResult})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ENTROPY TAB */}
        {activeTab === "entropy" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Entropía de la Distribución del Mercado (Shannon)</h2>
              <p className="text-slate-500 text-sm mt-1">Mide qué tan fragmentado o concentrado está un rubro de marcas.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Puntos/Share de Cada Marca (Separados por coma)</label>
              <input 
                type="text" 
                placeholder="Ejemplo: 30, 20, 10, 5"
                value={entropyShares} onChange={(e) => setEntropyShares(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-2">Puedes poner los porcentajes tal cual (40.5, 30.2, 29.3) o los puntos brutos de las batallas y el motor los normalizará automáticamente.</p>
            </div>

            <button 
              onClick={testEntropy} disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Analizar Entropía del Rubro
            </button>

            {entropyResult !== null && (
              <div className="mt-8 p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                <p className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Índice de Entropía</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-purple-900">{entropyResult.toFixed(4)}</span>
                </div>
                <p className="mt-3 text-sm text-purple-800">
                  {entropyResult < 1 ? "Baja Entropía: Muestra Monopolio o Alta Concentración. Una marca domina a todas las demás." : 
                   entropyResult < 2 ? "Entropía Media: Competencia saludable con líderes claros." : 
                   "Alta Entropía: Mercado híper-fragmentado. Muchas opciones similares compiten sin un líder dominante."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
