// Pitch Page
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { demoStore, type DemoSignal, type DemoDuel, type DemoBrand } from '../../signals/utils/demoData';
import DemoSignalCard from '../../signals/components/DemoSignalCard';

function duelFromSignal(s: DemoSignal): DemoDuel {
    const optA = s.options?.[0]?.label ?? 'Opción A';
    const optB = s.options?.[1]?.label ?? 'Opción B';

    const brandA: DemoBrand = { id: `pitch-a-${s.id}`, name: optA, emoji: '🅰️', categorySlug: 'pitch' };
    const brandB: DemoBrand = { id: `pitch-b-${s.id}`, name: optB, emoji: '🅱️', categorySlug: 'pitch' };

    return {
        id: `pitch-duel-${s.id}`,
        brandA,
        brandB,
        categorySlug: 'pitch',
        stats: { percentA: 50, totalVotes: 0 },
        startTime: Date.now(),
    };
}

export default function Pitch() {
    const navigate = useNavigate();
    const [demoDuel, setDemoDuel] = useState<DemoDuel | null>(null);

    useEffect(() => {
        demoStore.init();
        const trends = demoStore.getTrend(10);
        const randomSignal = trends[Math.floor(Math.random() * Math.max(1, trends.length))];

        if (randomSignal) {
            setDemoDuel(duelFromSignal(randomSignal));
        } else {
            setDemoDuel(null);
        }
    }, []);

    const goToSignals = () => navigate('/senales');

    const handleCardClick = () => {
        navigate('/senales');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

            {/* SECCIÓN 1 — APERTURA */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h1 className="text-[clamp(40px,6vw,80px)] font-black tracking-tighter leading-[1.1] mb-6 max-w-3xl">
                    La opinión pública es frágil.<br />
                    <span className="text-gray-400">Solo no la estamos midiendo bien.</span>
                </h1>
                <p className="text-[clamp(20px,3vw,32px)] text-gray-500 font-normal leading-snug max-w-xl mb-10">
                    Hoy creemos que las opiniones son estables.<br />
                    <strong>No lo son.</strong>
                </p>
                <button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={goToSignals}
                >
                    👉 Ver tendencia ahora
                </button>
            </section>

            {/* SECCIÓN 2 — EL PROBLEMA */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h2 className="text-[clamp(32px,5vw,60px)] font-extrabold tracking-tight leading-[1.1] mb-6">
                    Las encuestas tradicionales:
                </h2>
                <ul className="list-none p-0 m-0 mb-10">
                    <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                        <span className="text-red-500">•</span> Son lentas
                    </li>
                    <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                        <span className="text-red-500">•</span> Son caras
                    </li>
                    <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                        <span className="text-red-500">•</span> Llegan tarde
                    </li>
                </ul>
                <p className="text-[clamp(20px,3vw,32px)] text-gray-500 font-normal leading-snug max-w-xl mb-10">
                    Y tratan todas las opiniones como si fueran iguales.<br />
                    <strong className="text-gray-900">Eso es un error.</strong>
                </p>
            </section>

            {/* SECCIÓN 3 — DEMOSTRACIÓN */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h2 className="text-[clamp(40px,6vw,70px)] font-extrabold tracking-tight leading-[1.1] mb-6">
                    En Opina+, una sola señal<br />
                    puede mover una tendencia.
                </h2>

                {demoDuel && (
                    <div className="w-full max-w-md mt-10">
                        <DemoSignalCard
                            signal={demoDuel}
                            onClick={handleCardClick}
                            span={12}
                            highlight={true}
                        />
                        <div className="text-center mt-4">
                            <span className="text-[13px] text-gray-400 font-medium">
                                👆 Esta señal es real (demo). Toca para participar.
                            </span>
                        </div>
                    </div>
                )}

                {!demoDuel && (
                    <button
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-lg"
                        onClick={goToSignals}
                    >
                        👉 Abrir una señal
                    </button>
                )}
            </section>

            {/* SECCIÓN 4 — DIFERENCIA CLAVE */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h1 className="text-[clamp(40px,6vw,80px)] font-black tracking-tighter leading-[1.1] mb-6 max-w-3xl">
                    El promedio no sirve.
                </h1>
                <p className="text-[clamp(20px,3vw,32px)] text-gray-500 font-normal leading-snug max-w-xl mb-10">
                    La diferencia no está en cuántos opinan,<br />
                    <strong>sino en quién opina.</strong>
                </p>
                <button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={goToSignals}
                >
                    👉 Ver segmentación
                </button>
            </section>

            {/* SECCIÓN 5 — VALOR DEL DATO */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <p className="text-[clamp(20px,3vw,32px)] text-gray-500 font-normal leading-snug max-w-3xl mb-10">
                    Una marca, un medio o una institución<br />
                    no necesita saber qué piensa 'la gente'.
                </p>
                <div className="my-10">
                    <h3 className="text-3xl font-extrabold mb-4 text-gray-900">Necesita saber:</h3>
                    <ul className="list-none p-0">
                        <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                            1. Quién piensa qué
                        </li>
                        <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                            2. Dónde
                        </li>
                        <li className="text-[clamp(24px,4vw,40px)] font-bold mb-4 text-gray-900 flex items-center gap-4">
                            3. Y cómo cambia en el tiempo
                        </li>
                    </ul>
                </div>
                <p className="text-[clamp(32px,5vw,60px)] font-extrabold tracking-tight leading-[1.1] mt-10">
                    Eso es inteligencia.
                </p>
            </section>

            {/* SECCIÓN 6 — QUÉ ES OPINA+ */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h1 className="text-[clamp(40px,6vw,80px)] font-black tracking-tighter leading-[1.1] mb-6 max-w-3xl">
                    Opina+ no es una app de encuestas.
                </h1>
                <p className="text-[40px] leading-[1.2] font-semibold text-gray-900 max-w-2xl">
                    Es un sistema de señales<br />
                    que convierte interacción en datos vivos.
                </p>
            </section>

            {/* SECCIÓN 7 — CIERRE */}
            <section className="min-h-[80vh] flex flex-col justify-center items-start max-w-4xl mx-auto py-16 px-6 relative">
                <h1 className="text-[clamp(50px,8vw,100px)] font-black tracking-tighter leading-[1.1] mb-10">
                    Opina+ no mide opiniones.<br />
                    Mide cómo se forman.
                </h1>
                <div className="h-10" />
                <button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={goToSignals}
                >
                    👉 Volver al producto
                </button>
            </section>

        </div>
    );
}
