import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MODULES, OpinaModule } from "../modulesConfig";
import PageHeader from "../../../components/ui/PageHeader";

// Preview Templates
import PreviewShell from "../../modulesPreviews/PreviewShell";
import PreviewFilterBar from "../../modulesPreviews/PreviewFilterBar";
import PreviewList from "../../modulesPreviews/PreviewList";
import PreviewDetailDrawer from "../../modulesPreviews/PreviewDetailDrawer";
import PreviewContextCheck from "../../modulesPreviews/PreviewContextCheck";
import PreviewNewsCard from "../../modulesPreviews/PreviewNewsCard";
import PreviewProductSheet from "../../modulesPreviews/PreviewProductSheet";
import PreviewNpsSurvey from "../../modulesPreviews/PreviewNpsSurvey";
import { rateLimit } from '../../../shared/utils/rateLimit';
import { moduleInterestService } from "../../modulesPreviews/moduleInterestService";
import { MODULE_EVENT_TYPES } from "../../signals/eventTypes";

export default function ComingSoonModule({ module }: { module?: OpinaModule }) {
    const nav = useNavigate();
    const { slug } = useParams();

    const activeModule = module || MODULES.find((m) => m.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Track module preview viewed signal
        if (activeModule && activeModule.status === 'soon') {
            const limitKey = `opina_module_viewed:${activeModule.slug}:daily:`;
            if (!rateLimit.hasSent(limitKey)) {
                moduleInterestService.trackModuleInterestEvent(MODULE_EVENT_TYPES.MODULE_PREVIEW_VIEWED, {
                    module_key: activeModule.title, // Fallback to title if id is not on interface
                    module_slug: activeModule.slug,
                    previewType: activeModule.previewType || 'unknown',
                    source: "coming_soon",
                    entry: "hub_card"
                });
                rateLimit.markSent(limitKey);
            }
        }
    }, [activeModule]);

    if (!activeModule) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-bold">
                Módulo no encontrado.
            </div>
        );
    }

    const renderPreviewContent = () => {
        const type = activeModule.previewType;
        const data = activeModule.previewData as any;

        switch (type) {
            case "context_check":
                return <PreviewContextCheck checkins={data.checkins} />;

            case "filters_places":
            case "filters_services":
                return (
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <PreviewFilterBar
                                categories={data.categories}
                                communes={data.communes}
                                placeholder={`Buscar ${activeModule.title.toLowerCase()}...`}
                            />
                            <PreviewList
                                items={data.items}
                                renderItem={(item, i) => (
                                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm opacity-60">
                                        <div className="w-full h-32 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-4xl">
                                                {activeModule.icon}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 mb-1">{item.name}</h4>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <span>{item.category}</span>
                                            <span className="flex items-center gap-1 text-amber-500">
                                                <span className="material-symbols-outlined text-[14px]">star</span>
                                                {item.rating}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <PreviewDetailDrawer
                            isOpen={true}
                            title={data.items[0].name}
                            category={data.items[0].category}
                            rating={data.items[0].rating}
                        />
                    </div>
                );

            case "news_opinion":
                return (
                    <div className="max-w-3xl mx-auto">
                        <PreviewFilterBar categories={["Política", "Economía", "Social", "Tecnología"]} />
                        <PreviewNewsCard items={data.news} />
                    </div>
                );

            case "scanner_product":
                return <PreviewProductSheet product={data.product} />;

            case "nps_survey":
                return <PreviewNpsSurvey question={data.nps_question} followUps={data.follow_ups} />;

            default:
                return (
                    <div className="py-20 text-center opacity-20 grayscale">
                        <span className="material-symbols-outlined text-6xl mb-4">construction</span>
                        <p className="font-black uppercase tracking-widest text-xs">Módulo en Construcción</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                title={activeModule.title}
                subtitle="Preview de Funcionalidad"
            />

            <PreviewShell
                title={activeModule.mockTitle || `El futuro de ${activeModule.title}`}
                description={activeModule.mockSubtitle || activeModule.description}
                icon={activeModule.icon}
                tone={activeModule.tone}
                bullets={activeModule.mockBullets || []}
                onBack={() => nav(-1)}
                onRequestLaunch={() => {
                    // Acción visual para el usuario
                    alert("¡Gracias por tu interés! Hemos registrado tu solicitud para priorizar este lanzamiento.");
                }}
            >
                {renderPreviewContent()}
            </PreviewShell>
        </div>
    );
}
