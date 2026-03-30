import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { 
    Rocket, ShieldAlert, CheckCircle2, XCircle, 
    RefreshCw, ChevronRight, AlertTriangle, MonitorPlay, Map,
    Home, LogIn, ActivitySquare, User, BarChart3, Building2,
} from "lucide-react";
import { 
    DEMO_THRESHOLDS, DEMO_AVAILABLE_SCENARIOS, 
    DEMO_RECOMMENDED_SCENARIO, DEMO_OFFICIAL_TOUR, 
    DEMO_EXCLUDED_SURFACES, DemoScenarioKey 
} from "../../../config/demoProtocol";

const { MIN_SIGNALS: MIN_SIGNALS_THRESHOLD, MIN_DEMOGRAPHICS: MIN_DEMOGRAPHICS_THRESHOLD, MIN_ENTITIES: MIN_ENTITIES_THRESHOLD } = DEMO_THRESHOLDS;

interface ValidationStatus {
    isGo: boolean;
    loading: boolean;
    checks: {
        categoryExists: boolean | null;
        isCategoryReady: boolean | null;
        entitiesCount: number;
        hasEnoughSignals: boolean | null;
        signalsCount: number;
        hasAnalyticsDemo: boolean | null;
        demographicsCount: number;
        error: string | null;
    };
}

export default function AdminDemoLaunchpad() {
    const [scenario, setScenario] = useState<DemoScenarioKey>(DEMO_RECOMMENDED_SCENARIO as DemoScenarioKey);
    const [status, setStatus] = useState<ValidationStatus>({
        isGo: false,
        loading: true,
        checks: {
            categoryExists: null,
            isCategoryReady: null,
            entitiesCount: 0,
            hasEnoughSignals: null,
            signalsCount: 0,
            hasAnalyticsDemo: null,
            demographicsCount: 0,
            error: null
        }
    });

    const runValidation = useCallback(async () => {
        setStatus(prev => ({ ...prev, loading: true }));
        try {
            const currentScenario = DEMO_AVAILABLE_SCENARIOS[scenario];
            let isGo = true;

            // 1. Ver categoría
            const { data: catData, error: catErr } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', currentScenario.slug)
                .single();

            if (catErr || !catData) {
                setStatus({
                    isGo: false, loading: false, checks: {
                        categoryExists: false, isCategoryReady: false, entitiesCount: 0,
                        hasEnoughSignals: false, signalsCount: 0, hasAnalyticsDemo: false, demographicsCount: 0,
                        error: `No se encontró la categoría base: ${currentScenario.slug}`
                    }
                });
                return;
            }

            // 2. Ver Entidades
            const { data: entData, error: entErr } = await supabase
                .from('signal_entities')
                .select('id')
                .eq('category_id', catData.id)
                .eq('status', 'active');

            const entsCount = entData?.length || 0;
            const isCatsReady = !entErr && entsCount >= MIN_ENTITIES_THRESHOLD;
            if (!isCatsReady) isGo = false;

            const entityIds = entData?.map((e: { id: string }) => e.id) || [];

            // 3. Ver Señales B2C
            let sigsCount = 0;
            let hasSigs = false;
            let uniqueUserIds: string[] = [];

            if (entityIds.length > 0) {
                const { data: sigData, error: sigErr } = await supabase
                    .from('signal_events')
                    .select('user_id, entity_id')
                    .in('entity_id', entityIds)
                    .eq('module_type', 'versus');

                sigsCount = sigData?.length || 0;
                hasSigs = !sigErr && sigsCount >= MIN_SIGNALS_THRESHOLD;
                if (!hasSigs) isGo = false;

                uniqueUserIds = [...new Set(sigData?.map((s) => s.user_id as string) || [])];
            } else {
                isGo = false;
            }

            // 4. Ver Cruces B2B
            let demosCount = 0;
            let hasAnalytics = false;

            if (uniqueUserIds.length > 0) {
                const { data: demoData, error: demoErr } = await supabase
                    .from('user_demographics' as any)
                    .select('id')
                    .in('user_id', uniqueUserIds);

                demosCount = demoData?.length || 0;
                hasAnalytics = !demoErr && demosCount >= MIN_DEMOGRAPHICS_THRESHOLD;
                if (!hasAnalytics) isGo = false;
            } else {
                isGo = false;
            }

            setStatus({
                isGo,
                loading: false,
                checks: {
                    categoryExists: true,
                    isCategoryReady: isCatsReady,
                    entitiesCount: entsCount,
                    hasEnoughSignals: hasSigs,
                    signalsCount: sigsCount,
                    hasAnalyticsDemo: hasAnalytics,
                    demographicsCount: demosCount,
                    error: null
                }
            });

        } catch (error: unknown) {
            const err = error as Error;
            setStatus({
                isGo: false,
                loading: false,
                checks: {
                    categoryExists: null, isCategoryReady: null, entitiesCount: 0,
                    hasEnoughSignals: null, signalsCount: 0, hasAnalyticsDemo: null, demographicsCount: 0,
                    error: err.message || "Error desconocido validando el entorno de demo"
                }
            });
        }
    }, [scenario]);

    useEffect(() => {
        runValidation();
    }, [runValidation]);

    const { checks, loading, isGo } = status;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen relative pb-32">
            {/* Cabecera Institutional */}
            <div className="bg-slate-900 rounded-3xl p-8 mb-8 shadow-sm border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 saturate-0 pointer-events-none">
                    <Rocket className="w-64 h-64 -translate-y-8 translate-x-12" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-800 p-2.5 rounded-xl text-slate-300 border border-slate-700/50">
                            <MonitorPlay className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Pilot Launchpad</h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl text-base leading-relaxed mt-2">
                        Modo operativo para dirigir demostraciones y presentaciones de producto (B2B/B2C). Valida el estado del sembrado de datos (Cold Start) y navega Opina+ utilizando el recorrido oficial para minimizar fricciones comerciales.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Lado Izquierdo: Estado del Entorno (GO / NO-GO) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center justify-between">
                            <span>1. Escenario Activo</span>
                            <Map className="w-4 h-4 text-slate-400" />
                        </h3>
                        
                        <div className="flex flex-col gap-3">
                            {(Object.keys(DEMO_AVAILABLE_SCENARIOS) as DemoScenarioKey[]).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setScenario(key)}
                                    className={`text-left px-4 py-3 rounded-2xl border transition-all ${
                                        scenario === key 
                                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-slate-900">{DEMO_AVAILABLE_SCENARIOS[key].name}</div>
                                        {scenario === key && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">slug: {DEMO_AVAILABLE_SCENARIOS[key].slug}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden ${
                        loading ? 'bg-slate-50 border-slate-200' : 
                        isGo ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${
                                isGo && !loading ? 'text-emerald-900' : (!isGo && !loading ? 'text-red-900' : 'text-slate-900')
                            }`}>
                                2. Validation Status
                            </h3>
                            <button onClick={runValidation} disabled={loading} className="p-1 hover:bg-black/5 rounded-md transition-colors">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-400' : 'text-slate-600'}`} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                                <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-3"></div>
                                <span className="text-sm font-bold">Verificando sembrado...</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    {isGo ? (
                                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200">
                                            <ShieldAlert className="w-6 h-6 text-red-600" />
                                        </div>
                                    )}
                                    <div>
                                        <div className={`text-2xl font-black ${isGo ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {isGo ? 'GO' : 'NO-GO'}
                                        </div>
                                        <div className={`text-xs font-bold ${isGo ? 'text-emerald-600' : 'text-red-600/80'} uppercase tracking-wide`}>
                                            {isGo ? 'Piloto listo para mostrar' : 'Ruta crítica vacía'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <ValidationItem 
                                        label="Surface: Signals Hub" 
                                        description={`${checks.entitiesCount} entidades activas (requiere ≥ ${MIN_ENTITIES_THRESHOLD})`}
                                        pass={checks.isCategoryReady} 
                                    />
                                    <ValidationItem 
                                        label="Surface: Results B2C" 
                                        description={`${checks.signalsCount} votos base (requiere ≥ ${MIN_SIGNALS_THRESHOLD})`}
                                        pass={checks.hasEnoughSignals} 
                                    />
                                    <ValidationItem 
                                        label="Surface: Intelligence B2B" 
                                        description={`${checks.demographicsCount} usuarios perfilados (requiere ≥ ${MIN_DEMOGRAPHICS_THRESHOLD})`}
                                        pass={checks.hasAnalyticsDemo} 
                                    />
                                </div>

                                {!isGo && (
                                    <div className="mt-6 bg-red-100 border border-red-200 rounded-xl p-4 text-sm text-red-800 font-semibold flex gap-2">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <p>
                                            El entorno se verá vacío frente a clientes. <br className="hidden md:block"/>
                                            Para resolverlo, aborta la demo, ve a la terminal del proyecto y ejecuta: 
                                            <code className="block w-full bg-red-900 text-white p-2 rounded-lg mt-2 font-mono text-xs">
                                                npm run demo:prepare:{scenario} --allow-demo-seed
                                            </code>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado Derecho: Oficial Tour Sequence */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-2">3. Recorrido Comercial (SOP)</h2>
                        <p className="text-slate-500 mb-8 max-w-xl text-sm">
                            Secuencia formal recomendada para presentar la plataforma. Evita iteraciones no probadas si el objetivo es demostrar valor y confianza.
                        </p>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {DEMO_OFFICIAL_TOUR.map((stepInfo, idx) => {
                                // Maps string names to Lucide components
                                const iconsMap: Record<string, JSX.Element> = {
                                    Home: <Home className="w-5 h-5" />,
                                    LogIn: <LogIn className="w-5 h-5" />,
                                    ActivitySquare: <ActivitySquare className="w-5 h-5" />,
                                    User: <User className="w-5 h-5" />,
                                    BarChart3: <BarChart3 className="w-5 h-5" />,
                                    Building2: <Building2 className="w-5 h-5" />
                                };
                                const renderedIcon = iconsMap[stepInfo.iconName] || <Rocket className="w-5 h-5" />;
                                const injectedPath = stepInfo.path.replace('{slug}', DEMO_AVAILABLE_SCENARIOS[scenario].slug);
                                const isLast = idx === DEMO_OFFICIAL_TOUR.length - 1;

                                return (
                                    <TourStep 
                                        key={stepInfo.step}
                                        step={stepInfo.step}
                                        title={stepInfo.title}
                                        description={stepInfo.description}
                                        path={injectedPath}
                                        icon={renderedIcon}
                                        isLast={isLast}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-200/50">
                        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Superficies fuera del recorrido oficial
                        </h3>
                        <p className="text-amber-800 text-sm mb-3">
                            Durante demos externas a stakeholders <strong>evita navegar hacia</strong> estas superficies no preparadas para el piloto comercial:
                        </p>
                        <ul className="text-amber-800 text-sm list-disc pl-5 space-y-1 font-medium">
                            {DEMO_EXCLUDED_SURFACES.map((surface, idx) => (
                                <li key={idx}>{surface}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ValidationItem({ label, description, pass }: { label: string, description: string, pass: boolean | null }) {
    if (pass === null) return null;
    return (
        <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl">
            {pass ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            <div>
                <div className="font-bold text-slate-900 text-sm">{label}</div>
                <div className="text-xs text-slate-500">{description}</div>
            </div>
        </div>
    )
}

function TourStep({ step, title, description, path, icon, isLast = false }: { step: number, title: string, description: string, path: string, icon: React.ReactNode, isLast?: boolean }) {
    return (
        <div className="flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active relative">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow-sm shrink-0 md:order-1 ${isLast ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-slate-400'}`}>
                {icon}
            </div>
            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group-hover:-translate-y-1 ${isLast ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Paso {step}</div>
                    <Link to={path} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        Launch <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
