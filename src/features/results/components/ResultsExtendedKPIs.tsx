import { TrendingUp, AlertTriangle, Newspaper, Users2, Network, Heart, ShieldCheck, Briefcase, Target, Compass } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";

interface Props {
    predictive: ResultsCommunitySnapshot["predictive"];
    explanatory: ResultsCommunitySnapshot["explanatory"];
    productHealth: ResultsCommunitySnapshot["productHealth"];
    integrity: ResultsCommunitySnapshot["integrity"];
    commercial: ResultsCommunitySnapshot["commercial"];
    /** Si true, oculta integrity + productHealth (uso público B2C). Default: false (admin/intel). */
    publicMode?: boolean;
}

/**
 * 5 capas extendidas del marco metodológico ampliado (F9-F13):
 *  - Predictiva: hacia dónde va la opinión
 *  - Explicativa: por qué se mueve
 *  - Salud del producto: cómo está la red de Opina+
 *  - Integridad: alertas de fraude/brigading
 *  - Comercial B2B: insights accionables para clientes
 *
 * Cada capa solo se renderiza si tiene al menos un dato real (no decoración).
 */
export function ResultsExtendedKPIs({ predictive, explanatory, productHealth, integrity, commercial, publicMode = false }: Props) {
    const hasPredictive = predictive.forecastedLeaderShare7d != null || predictive.tippingPointDays != null || predictive.volatilityRegimeChangeLabel != null;
    const hasExplanatory = explanatory.newsImpactLagHours != null || explanatory.cohortDefectionSignal != null || explanatory.topicCorrelationTop3 != null;
    const hasHealth = !publicMode && (productHealth.moduleDiscoveryRate != null || productHealth.moduleFrictionScore != null || productHealth.cohortHalfLifeDays != null || productHealth.userReputationP50 != null);
    const hasIntegrity = !publicMode && (integrity.suspiciousClusterIndex != null || integrity.botSuspicionScore != null || integrity.brigadingAlertLabel != null);
    const hasCommercial = commercial.conversionImpactEstimatorLabel != null || commercial.competitiveVulnerabilityWindowLabel != null || commercial.whiteSpaceCategoryLabel != null;

    if (!hasPredictive && !hasExplanatory && !hasHealth && !hasIntegrity && !hasCommercial) return null;

    return (
        <section className="w-full max-w-6xl mx-auto px-4 mt-12 mb-12">
            <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand bg-brand/5 px-3 py-1 rounded-full border border-brand/10">
                    Marco metodológico extendido
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight mt-4">
                    Más allá de lo descriptivo
                </h2>
                <p className="text-sm md:text-base font-medium text-slate-600 leading-relaxed mt-2">
                    Capas predictiva, explicativa, de salud y comercial. Solo aparecen las métricas con datos suficientes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* PREDICTIVA */}
                {hasPredictive && (
                    <div className="bg-white border border-stroke rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-brand" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                Predictiva — hacia dónde va
                            </span>
                        </div>
                        <div className="space-y-3">
                            {predictive.forecastedLeaderShare7d != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Forecast del líder a 7d</div>
                                    <div className="text-2xl font-black text-ink tracking-tighter">{predictive.forecastedLeaderShare7d}%</div>
                                </div>
                            )}
                            {predictive.tippingPointDays != null && (
                                <div className="p-2 bg-warning-50 border border-warning-100 rounded-xl">
                                    <div className="text-[9px] font-bold text-warning-600 uppercase tracking-widest mb-1">Tipping point</div>
                                    <div className="text-xs font-bold text-slate-700">~{predictive.tippingPointDays} días para que el segundo alcance al líder</div>
                                </div>
                            )}
                            {predictive.volatilityRegimeChangeLabel && (
                                <div className="text-[10px] font-bold text-slate-500 italic">{predictive.volatilityRegimeChangeLabel}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* EXPLICATIVA */}
                {hasExplanatory && (
                    <div className="bg-white border border-stroke rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Newspaper className="w-4 h-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                Explicativa — por qué se mueve
                            </span>
                        </div>
                        <div className="space-y-3">
                            {explanatory.newsImpactLagHours != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">News → Voto: lag medio</div>
                                    <div className="text-xl font-black text-ink tracking-tighter">{explanatory.newsImpactLagHours}h</div>
                                </div>
                            )}
                            {explanatory.cohortDefectionSignal && (
                                <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                                    <Users2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                    <div className="text-xs font-medium text-slate-700">{explanatory.cohortDefectionSignal}</div>
                                </div>
                            )}
                            {explanatory.topicCorrelationTop3 && (
                                <div className="flex items-start gap-2">
                                    <Network className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="text-[10px] font-medium text-slate-500 leading-snug">{explanatory.topicCorrelationTop3}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SALUD DEL PRODUCTO */}
                {hasHealth && (
                    <div className="bg-white border border-stroke rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-4 h-4 text-brand" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                Salud de la red
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {productHealth.moduleDiscoveryRate != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Discovery</div>
                                    <div className="text-lg font-black text-ink tracking-tighter">{productHealth.moduleDiscoveryRate}%</div>
                                </div>
                            )}
                            {productHealth.moduleFrictionScore != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fricción</div>
                                    <div className={`text-lg font-black tracking-tighter ${productHealth.moduleFrictionScore > 30 ? "text-danger-500" : "text-ink"}`}>{productHealth.moduleFrictionScore}%</div>
                                </div>
                            )}
                            {productHealth.cohortHalfLifeDays != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Half-life</div>
                                    <div className="text-lg font-black text-ink tracking-tighter">{productHealth.cohortHalfLifeDays}d</div>
                                </div>
                            )}
                            {productHealth.userReputationP50 != null && (
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reputación p50</div>
                                    <div className="text-lg font-black text-ink tracking-tighter">{productHealth.userReputationP50}/100</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* INTEGRIDAD */}
                {hasIntegrity && (
                    <div className={`border rounded-3xl p-5 shadow-sm ${integrity.brigadingAlertLabel ? "bg-danger-50 border-danger-100" : "bg-white border-stroke"}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className={`w-4 h-4 ${integrity.brigadingAlertLabel ? "text-danger-500" : "text-accent"}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                Integridad
                            </span>
                        </div>
                        <div className="space-y-3">
                            {integrity.brigadingAlertLabel && (
                                <div className="flex items-start gap-2 p-2 bg-white rounded-xl border border-danger-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-danger-500 shrink-0 mt-0.5" />
                                    <div className="text-xs font-bold text-danger-600">{integrity.brigadingAlertLabel}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                {integrity.suspiciousClusterIndex != null && (
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cluster sosp.</div>
                                        <div className={`text-lg font-black tracking-tighter ${integrity.suspiciousClusterIndex > 70 ? "text-danger-500" : "text-ink"}`}>{integrity.suspiciousClusterIndex}/100</div>
                                    </div>
                                )}
                                {integrity.botSuspicionScore != null && (
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bot suspicion</div>
                                        <div className={`text-lg font-black tracking-tighter ${integrity.botSuspicionScore > 30 ? "text-danger-500" : "text-ink"}`}>{integrity.botSuspicionScore}%</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMERCIAL B2B */}
                {hasCommercial && (
                    <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm md:col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-4 h-4 text-brand-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-200">
                                Inteligencia accionable B2B
                            </span>
                        </div>
                        <div className="space-y-3">
                            {commercial.conversionImpactEstimatorLabel && (
                                <div className="flex items-start gap-2 bg-white/10 rounded-xl p-3">
                                    <Target className="w-4 h-4 text-brand-200 shrink-0 mt-0.5" />
                                    <div className="text-sm font-bold text-white leading-snug">{commercial.conversionImpactEstimatorLabel}</div>
                                </div>
                            )}
                            {commercial.competitiveVulnerabilityWindowLabel && (
                                <div className="flex items-start gap-2 text-xs font-medium text-brand-200">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>{commercial.competitiveVulnerabilityWindowLabel}</span>
                                </div>
                            )}
                            {commercial.whiteSpaceCategoryLabel && (
                                <div className="flex items-start gap-2 text-xs font-medium text-accent">
                                    <Compass className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>{commercial.whiteSpaceCategoryLabel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
