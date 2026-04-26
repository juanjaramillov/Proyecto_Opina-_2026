import { useState, useEffect } from "react";
import { Calculator, Clock, BarChart2, Activity, Save } from "lucide-react";
import toast from 'react-hot-toast';
import { mathEngineService } from "../services/mathEngineService";
import { Link } from "react-router-dom";
import { GradientText } from "../../../components/ui/foundation";

export default function AdminMathEngine() {
  const [activeTab, setActiveTab] = useState<"decay" | "wilson" | "entropy">("decay");

  // DB Config State
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configParams, setConfigParams] = useState<Record<string, number | string | null> | null>(null);

  // Load config on mount
  useEffect(() => {
    mathEngineService.getEngineConfig().then(data => {
      setConfigParams(data);
      if (data?.decay_half_life_days) setHalfLife(data.decay_half_life_days);
      if (data?.wilson_confidence_level) setConfidence(data.wilson_confidence_level);
      if (data?.entropy_base) setEntropyBase(data.entropy_base);
    }).catch(console.error).finally(() => setLoadingConfig(false));
  }, []);

  const handleSaveConfig = async (key: string, value: number) => {
    setSavingConfig(true);
    setError(null);
    try {
      await mathEngineService.updateEngineConfig({ [key]: value });
      setConfigParams(prev => prev ? { ...prev, [key]: value } : { [key]: value });
      toast.success("Configuración guardada");
    } catch(e) {
      if (e instanceof Error) setError(e.message);
      else setError("Error al guardar la configuración");
    } finally {
      setSavingConfig(false);
    }
  };

  // State: Time Decay
  const [decayDays, setDecayDays] = useState(15);
  const [halfLife, setHalfLife] = useState(30);
  const [decayResult, setDecayResult] = useState<number | null>(null);

  // State: Wilson Score
  const [posVotes, setPosVotes] = useState(1);
  const [totVotes, setTotVotes] = useState(1);
  const [confidence, setConfidence] = useState(0.95);
  const [wilsonResult, setWilsonResult] = useState<number | null>(null);

  // State: Shannon Entropy
  const [entropyShares, setEntropyShares] = useState<string>("0.5, 0.5");
  const [entropyBase, setEntropyBase] = useState(2.0);
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
      if (err instanceof Error) setError(err.message);
      else setError("Error al simular Time Decay");
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
      // Confianza típica: 0.95 => z=1.96. En nuestra BD opina_math_wilson_score el z_value o alpha se pasa. Asumamos z_value aprox 1.96 para 0.95
      let zValue = 1.96;
      if (confidence === 0.90) zValue = 1.645;
      if (confidence === 0.99) zValue = 2.576;
      
      const res = await mathEngineService.simulateWilsonScore(p, Math.max(p, t), zValue);
      setWilsonResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al simular Wilson Score");
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
      // Simulate with specific base roughly scaling it (though DB function handles it statically right now)
      // Since db function might hardcode base 2, let's just show it.
      setEntropyResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al simular Entropía");
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return <div className="min-h-screen bg-slate-50 p-6 lg:p-10 flex items-center justify-center">Cargando Motor Canónico...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-brand" />
            <GradientText>Motor Estadístico</GradientText>
          </h1>
          <p className="text-slate-500 mt-1">
            Auditoría y gobernanza en vivo de las fórmulas matemáticas nativas de la base de datos (Canonical Analytics).
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
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "decay" ? "bg-brand-100 text-brand-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Clock className="w-4 h-4" />
          Time Decay (Vida Media)
        </button>
        <button
          onClick={() => setActiveTab("wilson")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "wilson" ? "bg-brand-100 text-brand-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <BarChart2 className="w-4 h-4" />
          Wilson Score Interval
        </button>
        <button
          onClick={() => setActiveTab("entropy")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${activeTab === "entropy" ? "bg-brand-100 text-brand-800" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Activity className="w-4 h-4" />
          Entropía de Shannon
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 text-danger-700 rounded-xl border border-danger-200 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Lab Area */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-4xl">
        
        {/* TIME DECAY TAB */}
        {activeTab === "decay" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Configuración Central de Time Decay</h2>
                <p className="text-slate-500 text-sm mt-1">Controla cómo se devalúa el peso histórico de los votos en los Rollups Canónicos.</p>
              </div>
              <button 
                onClick={() => handleSaveConfig('decay_half_life_days', halfLife)}
                disabled={savingConfig || configParams?.decay_half_life_days === halfLife}
                className="px-4 py-2 flex items-center gap-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-700 disabled:opacity-50 transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar en Global
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Simulador: Antigüedad (días): {decayDays}</label>
                <input 
                  type="range" min="0" max="180" 
                  value={decayDays} onChange={(e) => setDecayDays(Number(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Constante Global: Vida Media (días): {halfLife}</label>
                <select 
                  value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
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
              <div className="mt-8 p-6 bg-brand-50 border border-brand-100 rounded-2xl">
                <p className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-1">Peso Estadístico Resultante</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-brand-900">{(decayResult * 100).toFixed(2)}%</span>
                  <span className="text-brand-700 font-medium mb-2">del valor original ({decayResult} factor)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WILSON SCORE TAB */}
        {activeTab === "wilson" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Umbral de Confianza (Wilson Score)</h2>
                <p className="text-slate-500 text-sm mt-1">Determina qué tan seguro debe estar el sistema antes de subir el puntaje real de una marca o tema.</p>
              </div>
              <button 
                onClick={() => handleSaveConfig('wilson_confidence_level', confidence)}
                disabled={savingConfig || configParams?.wilson_confidence_level === confidence}
                className="px-4 py-2 flex items-center gap-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-700 disabled:opacity-50 transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar en Global
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Señales Positivas a Favor</label>
                <input 
                  type="number" min="0" 
                  value={posVotes} onChange={(e) => setPosVotes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
                />
                
                <label className="block text-sm font-bold text-slate-700 mt-4 mb-2">Total Emitidas (Pos + Neg/Skips)</label>
                <input 
                  type="number" min="1" 
                  value={totVotes} onChange={(e) => setTotVotes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nivel de Confianza Global</label>
                <select 
                  value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
                >
                  <option value={0.90}>90% (Más agresivo)</option>
                  <option value={0.95}>95% (Estándar Estadístico - Opina+)</option>
                  <option value={0.99}>99% (Muy conservador)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={testWilsonScore} disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Simular Win/Loss Margin (Wilson)
            </button>

            {wilsonResult !== null && (
              <div className="mt-8 p-6 bg-brand-50 border border-brand-100 rounded-2xl flex flex-col gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-1">Score Crudo Tradicional (Engañoso)</p>
                  <span className="text-3xl font-black text-slate-400">{((posVotes / Math.max(1, totVotes)) * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full h-px bg-brand-200"></div>
                <div>
                  <p className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-1">Score Real Inferior (Wilson)</p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-brand-900">{(wilsonResult * 100).toFixed(2)}%</span>
                    <span className="text-brand-700 font-medium mb-2">Score suavizado ({wilsonResult})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ENTROPY TAB */}
        {activeTab === "entropy" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Entropía Market Tension</h2>
                <p className="text-slate-500 text-sm mt-1">Mide qué tan fragmentado está el rubro.</p>
              </div>
              <button 
                onClick={() => handleSaveConfig('entropy_base', entropyBase)}
                disabled={savingConfig || configParams?.entropy_base === entropyBase}
                className="px-4 py-2 flex items-center gap-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-700 disabled:opacity-50 transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar en Global
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Puntos/Share de Cada Marca (Separados por coma)</label>
                <input 
                  type="text" 
                  placeholder="Ejemplo: 30, 20, 10, 5"
                  value={entropyShares} onChange={(e) => setEntropyShares(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Base Logarítmica</label>
                <select 
                  value={entropyBase} onChange={(e) => setEntropyBase(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand shadow-sm"
                >
                  <option value={2.0}>Base 2 (Bits - Estándar)</option>
                  <option value={2.71828}>Base e (Nats)</option>
                  <option value={10.0}>Base 10 (Decibeles)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={testEntropy} disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Analizar Entropía del Rubro
            </button>

            {entropyResult !== null && (
              <div className="mt-8 p-6 bg-brand-50 border border-brand-100 rounded-2xl">
                <p className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-1">Índice de Entropía</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-brand-900">{entropyResult.toFixed(4)}</span>
                </div>
                <p className="mt-3 text-sm text-brand-800">
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
