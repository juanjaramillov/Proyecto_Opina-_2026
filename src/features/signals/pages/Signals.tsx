import { useState } from 'react';
import { demoStore, demoCategories, type DemoBrand, type DemoInsightQuestion } from '../utils/demoData';
import DemoInsightModal from '../components/DemoInsightModal';
import TrendGrid from '../components/TrendGrid';
import ActiveBattleHero from '../components/ActiveBattleHero';
import BattleModal from '../components/BattleModal';

// --- REAL DATA SERVICE ---
import { signalService, type ActiveBattle } from '../../../services/signalService';
import { useActiveBattles } from '../../../hooks/useActiveBattles';
import { DEMO_MODE } from '../../../config/demoMode';
import { getDemoKpis } from '../../../demo/demoNumbers';
import { getDemoRanking, demoOrReal } from '../../../demo/demoLists';

// --- TYPES ---
type ViewState = 'hub' | 'feed' | 'insights' | 'directory' | 'product';
type VersusMode = 'none' | 'fast' | 'champion';

// --- COMPONENTS: TILT CARD ---
import SignalCard from '../components/SignalCard';

// --- IMPORTS ---

// --- CONFIGURATION ---

const CARDS_CONFIG = [
  {
    key: 'versus',
    title: 'Versus',
    description: 'Elige entre dos y define quién lidera.',
    icon: 'zap',

    view: 'feed',
    kpis: DEMO_MODE ? getDemoKpis('versus') : [
      { label: 'Estado', value: 'En vivo' },
      { label: 'Hoy', value: 'Alta actividad' },
      { label: 'Puntos', value: '+15' },
    ],
  },
  {
    key: 'directo',
    title: 'Directo al hueso',
    description: 'Un tema, varias preguntas. Sin vueltas.',
    icon: 'brain',

    view: 'insights',
    kpis: DEMO_MODE ? getDemoKpis('directo') : [
      { label: 'Estado', value: 'Activo' },
      { label: 'Hoy', value: 'Actividad media' },
      { label: 'Puntos', value: '+25' },
    ],
  },
  {
    key: 'recomendados',
    title: 'Recomendados',
    description: 'Busca y deja tu valoración en 1 minuto.',
    icon: 'map-pin',

    view: 'directory',
    kpis: DEMO_MODE ? getDemoKpis('recomendados') : [
      { label: 'Estado', value: 'Activo' },
      { label: 'Hoy', value: 'Actividad media' },
      { label: 'Puntos', value: '+10' },
    ],
  },
  {
    key: 'vitrina',
    title: 'En vitrina',
    description: 'Escanea o busca y mira la señal real.',
    icon: 'scan-barcode',

    view: 'product',
    kpis: DEMO_MODE ? getDemoKpis('vitrina') : [
      { label: 'Estado', value: 'Activo' },
      { label: 'Hoy', value: 'Actividad baja' },
      { label: 'Puntos', value: '+20' },
    ],
  },
] as const;

export default function Signals() {
  const [view, setView] = useState<ViewState>('hub');
  const [categories] = useState(demoCategories); // Keeping for directory view

  // Real Data Hook
  const { battles: activeBattles, loading: battlesLoading } = useActiveBattles();

  // --- VERSUS LOGIC ---
  const [versusMode, setVersusMode] = useState<VersusMode>('none');
  const [activeBattle, setActiveBattle] = useState<ActiveBattle | null>(null);

  // Type 1: Fast
  const [fastQueue, setFastQueue] = useState<ActiveBattle[]>([]);

  // --- INSIGHTS LOGIC & SESSION STATE ---
  const [insightTarget, setInsightTarget] = useState<DemoBrand | null>(null);
  const [activeInsightQuestions, setActiveInsightQuestions] = useState<DemoInsightQuestion[]>([]);

  // Session tracking
  const [sessionDuelCount, setSessionDuelCount] = useState(0);

  // --- OTHERS ---
  type MockProduct = { name: string; score: number; reviews: number; image: string };
  const [scannerCode, setScannerCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<MockProduct | null>(null);
  const [scanning, setScanning] = useState(false);

  // --- STATS LOGIC ---
  // const [totalSignals24h, setTotalSignals24h] = useState<number>(0);
  // const [statsLoading, setStatsLoading] = useState(true);

  // useEffect(() => {
  //   let mounted = true;
  //   const fetchStats = async () => {
  //     try {
  //       const trending = await signalService.getTrending24h();
  //       if (mounted) {
  //         const total = trending.reduce((acc, curr) => acc + (curr.responses24h || 0), 0);
  //         setTotalSignals24h(total);
  //         setStatsLoading(false);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching trending stats:', err);
  //       setStatsLoading(false);
  //     }
  //   };
  //   fetchStats();
  //   return () => { mounted = false; };
  // }, []);

  // const formatKpiValue = (val: number) => {
  //   if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  //   return val.toString();
  // };


  // --- MODE SELECTION ---
  const prepareFastVersus = () => {
    if (activeBattles.length === 0) {
      alert('No hay batallas activas cargadas.');
      return;
    }
    // Queue all active battles
    setFastQueue(activeBattles);
    setVersusMode('fast');
    setActiveBattle(activeBattles[0]);
  };

  const prepareChampionVersus = () => {
    alert('Modo Campeonato en mantenimiento. Intenta el modo Versus Rápido.');
  };

  // --- HANDLERS ---
  const endSession = () => {
    setActiveBattle(null);
    setVersusMode('none');
    setView('hub');

    setSessionDuelCount(0);
  };

  const handleBattleComplete = async (battleId: string, optionId: string, intensity: 'low' | 'high', reason: string) => {
    if (!activeBattle) return;

    const winnerOption = activeBattle.options.find(o => o.id === optionId);
    const winnerLabel = winnerOption?.label || optionId;

    // 1) Remote save
    const now = Date.now();
    // Assuming 2s duration for quality score logic
    const startTime = now - 2000;
    const qualityWeight = signalService.calculateQualityScore(startTime, now);

    await signalService.saveSignalEvent({
      source_type: 'versus',
      source_id: activeBattle.slug,
      title: `Versus: ${activeBattle.title}`,
      choice_label: winnerLabel,

      battle_id: activeBattle.id,
      option_id: optionId,

      signal_weight: qualityWeight,
      user_tier: 'guest',
      meta: {
        intensity,
        reason
      }
    });

    // 2) Update Session logic
    const nextCount = sessionDuelCount + 1;

    if (versusMode === 'fast') {
      const currentIdx = fastQueue.findIndex(b => b.id === battleId);
      const nextIdx = currentIdx + 1;

      if (nextCount >= 5 || nextIdx >= fastQueue.length) {
        endSession();
      } else {
        setActiveBattle(fastQueue[nextIdx]);
      }
    } else {
      endSession();
    }
  };

  const handleBack = () => {
    setView('hub');
    setScannedProduct(null);
    setScannerCode('');
    setVersusMode('none');
    setActiveBattle(null);
    setInsightTarget(null);
  };

  const openInsight = (brand: DemoBrand) => {
    const qs = demoStore.getInsightsForBrand(brand.id);
    setActiveInsightQuestions(qs);
    setInsightTarget(brand);
  };

  const handleVersusClick = () => {
    setView('feed');
  };

  const handleScan = () => {
    if (!scannerCode.trim()) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedProduct({
        name: 'Refrigerador Samsung Bot',
        score: 4.8,
        reviews: 1240,
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b7275?auto=format&fit=crop&q=80&w=2000'
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-x-hidden">
      {/* DECORATION */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] animate-aurora-1" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px] animate-aurora-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-teal-50/50 blur-[120px] animate-aurora-3" />
      </div>
      <style>{`
        @keyframes aurora-1 { 0% { transform: translate(0,0); } 50% { transform: translate(20px, 40px); } 100% { transform: translate(0,0); } }
        @keyframes aurora-2 { 0% { transform: translate(0,0); } 50% { transform: translate(-30px, 20px); } 100% { transform: translate(0,0); } }
        @keyframes aurora-3 { 0% { transform: translate(0,0); } 50% { transform: translate(10px, -30px); } 100% { transform: translate(0,0); } }
        @keyframes shine { 100% { transform: translateX(100%); } }
        @keyframes float-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-aurora-1 { animation: aurora-1 15s infinite ease-in-out; }
        .animate-aurora-2 { animation: aurora-2 18s infinite ease-in-out; }
        .animate-aurora-3 { animation: aurora-3 20s infinite ease-in-out; }
        .animate-shine { animation: shine 1.5s; }
        .animate-float-in { animation: float-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .fill-mode-forwards { animation-fill-mode: forwards; }
      `}</style>

      <div className="max-w-[1000px] mx-auto pt-10 pb-20 px-6 relative z-10">
        {/* HEADER */}
        {view === 'hub' && (
          <div className="mb-12 text-center animate-float-in">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-100/80 shadow-sm text-[10px] font-black tracking-widest uppercase text-gray-400 mb-6">
              Opina+ Hub
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4 leading-none">
              ¿Qué opinas hoy?
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
              Elige tu impacto en el mundo real.
            </p>
          </div>
        )}

        {view !== 'hub' && (
          <div className="flex justify-between items-end flex-wrap gap-5 mb-10 animate-float-in">
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-sm font-bold text-gray-600 hover:text-gray-900 shadow-sm transition-all"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver
            </button>
            <h1 className="text-3xl font-black tracking-tight m-0 text-gray-900">
              {view === 'feed' && 'Versus'}
              {view === 'insights' && 'Directo al hueso'}
              {view === 'directory' && 'Recomendados'}
              {view === 'product' && 'En vitrina'}
            </h1>
          </div>
        )}

        {/* --- VIEW: HUB (VERTICAL STACK) --- */}
        {view === 'hub' && (
          <div className="flex flex-col gap-4">
            {/* Standard Configured Cards */}
            {CARDS_CONFIG.map((card, idx) => (
              <div key={card.key} className={`${card.key === 'versus' ? 'mb-5' : 'mb-4'}`}>
                <SignalCard
                  onClick={() => {
                    if (card.view === 'feed') handleVersusClick();
                    else setView(card.view as ViewState);
                  }}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}

                  delay={(idx + 1) * 100}
                  kpis={card.kpis}
                  isFeatured={card.key === 'versus'}
                  variant={card.key as any}
                />
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW: FEED --- */}
        {view === 'feed' && (
          <div className="animate-float-in">
            <ActiveBattleHero
              onOpenVersus={prepareFastVersus}
              onOpenPro={() => prepareChampionVersus()}
            />

            <div className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Tendencias (Versus previstos)</div>

            <TrendGrid
              battles={activeBattles}
              loading={battlesLoading}
              onBattleClick={(b) => {
                setFastQueue([b]);
                setVersusMode('fast');
                setActiveBattle(b);
              }}
            />
          </div>
        )}

        {/* --- VIEW: INSIGHTS --- */}
        {view === 'insights' && (
          <div className="animate-float-in space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-2">Packs de Marcas</h2>
              <p className="text-gray-500">Define el perfil de cada marca en 5 preguntas.</p>
            </div>

            {demoCategories.map(cat => {
              const brands = demoStore.getBrandsByCategory(cat.slug);
              if (brands.length === 0) return null;

              return (
                <div key={cat.slug}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">{cat.emoji}</span> {cat.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {brands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => openInsight(b)}
                        className="relative overflow-hidden rounded-[28px] bg-white/85 border border-black/5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all text-left group"
                      >
                        {/* Texture Overlay */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-gradient-to-br from-cyan-200/60 via-white/0 to-sky-200/60" />

                        <div className="relative z-10">
                          <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform origin-left">{b.emoji}</div>
                          <div className="font-black text-slate-900 text-lg leading-tight">{b.name}</div>
                          <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide">5 Preguntas</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: DIRECTORY */}
        {view === 'directory' && (
          <div className="animate-float-in">
            <h3 className="text-xl font-bold mb-4">Directorio de Servicios</h3>
            <div className="grid grid-cols-1 gap-6">
              {categories.map(c => {
                const ranking = demoOrReal(getDemoRanking(c.slug, 5), []);

                return (
                  <div key={c.slug} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <h4 className="font-bold text-lg text-gray-900">{c.name}</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {ranking.map((item, idx) => (
                        <div key={item.id} className="relative overflow-hidden rounded-[28px] bg-white/85 border border-black/5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] p-4 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all text-left">
                          {/* Tinte Overlay */}
                          <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-gradient-to-br from-emerald-200/60 via-white/0 to-teal-200/60" />

                          <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="text-xs font-bold text-slate-400">#{idx + 1}</div>
                            <div className={`text-xs font-bold ${item.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {item.trend > 0 ? '+' : ''}{item.trend}%
                            </div>
                          </div>
                          <div className="font-bold text-slate-800 text-sm mb-2 truncate leading-tight" title={item.name}>
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full shadow-sm" style={{ width: `${(item.score / 5) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{item.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: PRODUCT */}
        {view === 'product' && (
          <div className="max-w-xl mx-auto text-center py-10 animate-float-in">
            <h2 className="text-3xl font-black mb-10 text-gray-900">Escanea un código</h2>

            {!scannedProduct ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-[40px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative overflow-hidden rounded-[40px] bg-white/85 border border-black/5 shadow-[0_30px_80px_rgba(15,23,42,0.15)] p-10">
                  {/* Tinte Overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-gradient-to-br from-amber-200/60 via-white/0 to-orange-200/60" />

                  <div className="relative z-10">
                    <div className="text-6xl mb-6 animate-pulse grayscale opacity-80">📷</div>
                    <input
                      type="text"
                      placeholder="Ingresa código..."
                      value={scannerCode}
                      onChange={e => setScannerCode(e.target.value)}
                      className="w-full px-6 py-4 bg-white rounded-2xl border border-slate-200 font-bold mb-4 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-900 placeholder-slate-400 text-center shadow-sm"
                    />
                    <button
                      onClick={handleScan}
                      disabled={!scannerCode}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {scanning ? 'Buscando...' : 'Buscar Producto'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[40px] bg-white border border-black/5 shadow-2xl animate-float-in text-left">
                {/* Tinte Overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-gradient-to-br from-amber-200/60 via-white/0 to-orange-200/60 pointer-events-none z-10" />

                <div className="h-64 relative z-0">
                  <img src={scannedProduct.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white z-20">
                    <h3 className="text-2xl font-black text-white">{scannedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-emerald-500 rounded-lg text-xs font-bold text-white shadow-sm">{scannedProduct.score} ★</span>
                      <span className="text-sm font-medium opacity-90 text-white shadow-sm">{scannedProduct.reviews} opiniones</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 relative z-20">
                    <button onClick={() => setScannedProduct(null)} className="mt-4 w-full py-3 text-slate-400 font-bold text-xs hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Escanear otro</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {activeBattle && (
        <BattleModal
          battle={activeBattle}
          onClose={() => {
            setActiveBattle(null);
            setVersusMode('none');
          }}
          onComplete={handleBattleComplete}
          progressLabel={versusMode === 'fast' ? `Versus` : 'Versus'}
        />
      )}

      {insightTarget && (
        <DemoInsightModal
          brand={insightTarget}
          questions={activeInsightQuestions}
          onClose={() => setInsightTarget(null)}
        />
      )}
    </div>
  );
}
