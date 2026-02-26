import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MODULES, OpinaModule } from "../modulesConfig";
import PageHeader from "../../../components/ui/PageHeader";
import { Skeleton } from "../../../components/ui/Skeleton";

export default function ComingSoonModule({ module }: { module?: OpinaModule }) {
    const nav = useNavigate();
    const { slug } = useParams();

    // Si pasamos el modulo directo (ej. por componente padre), lo usamos.
    // Sino, lo buscamos en el array por slug.
    const activeModule = module || MODULES.find((m) => m.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!activeModule) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-bold">
                Módulo no encontrado.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                title={activeModule.title}
                subtitle="Preview de Funcionalidad"
            />

            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* Banner Principal de Mockup */}
                <div className="bg-white border text-center border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className={`w-16 h-16 mx-auto rounded-3xl mb-6 flex items-center justify-center bg-${activeModule.tone}-50 text-${activeModule.tone}-600 ring-4 ring-${activeModule.tone}-50/50`}>
                        <span className="material-symbols-outlined text-3xl">{activeModule.icon}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        {activeModule.mockTitle || `El futuro de ${activeModule.title}`}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium mt-3 max-w-2xl mx-auto">
                        {activeModule.mockSubtitle || activeModule.description}
                    </p>

                    <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 max-w-2xl mx-auto">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
                            Qué podrás hacer:
                        </h3>
                        <ul className="space-y-3">
                            {activeModule.mockBullets?.map((bullet, i) => (
                                <li key={i} className="flex flex-row items-start gap-3">
                                    <span className={`material-symbols-outlined text-${activeModule.tone}-500 text-xl shrink-0 mt-0.5`}>
                                        check_circle
                                    </span>
                                    <span className="text-slate-700 font-medium leading-relaxed">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Zona de Esqueletos / Visual Fake */}
                <div className="mt-8">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Ejemplo Visual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 pointer-events-none select-none">

                        {/* Columna Izquierda Mock */}
                        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
                            <Skeleton variant="text" className="w-1/3 h-6 mb-2" />
                            <div className="flex gap-4">
                                <Skeleton variant="card" className="h-40 w-full rounded-2xl" />
                                <Skeleton variant="card" className="h-40 w-full rounded-2xl" />
                            </div>
                            <Skeleton variant="text" className="h-4" />
                            <Skeleton variant="text" className="h-4" />
                        </div>

                        {/* Columna Derecha Mock */}
                        <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                            <Skeleton variant="circular" className="w-12 h-12 rounded-full mb-2" />
                            <Skeleton variant="text" className="h-4" />
                            <div className="w-full h-px bg-slate-100 my-2" />
                            <Skeleton variant="text" className="h-4" />
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center max-w-lg mx-auto">
                    <p className="text-xs text-slate-400 font-bold mb-6">
                        Nota: Este módulo aún no genera señales reales en la plataforma. Es un preview conceptual abierto hasta el lanzamiento oficial.
                    </p>
                    <button
                        onClick={() => nav("/experience")}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition active:scale-[0.98]"
                    >
                        Volver a Participa
                    </button>
                </div>
            </div>
        </div>
    );
}
