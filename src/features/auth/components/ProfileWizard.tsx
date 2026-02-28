import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { DemographicData } from "../types";
import { supabase } from "../../../supabase/client";
import { useToast } from "../../../components/ui/useToast";
import { accessGate } from "../../access/services/accessGate";

const REGIONS = ["Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"];

const COMUNAS_SANTIAGO = [
    "Santiago", "Conchalí", "El Bosque", "Estación Central", "Huechuraba",
    "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana",
    "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado",
    "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén",
    "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta",
    "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura",
    "Puente Alto", "Pirque", "San José de Maipo", "San Bernardo", "Calera de Tango",
    "Buin", "Paine", "Colina", "Lampa", "Tiltil", "Talagante", "Isla de Maipo",
    "El Monte", "Peñaflor", "Padre Hurtado", "Melipilla", "Alhué", "Curacaví",
    "María Pinto", "San Pedro"
].sort();

const EMPLOYMENT_OPTIONS = ["Estudiante", "Trabajador Dependiente", "Independiente / Freelance", "Empresario / Emprendedor", "Jubilado", "Desempleado", "Otro"];
const INCOME_OPTIONS = ["Menos de $500.000", "$500.000 - $1.000.000", "$1.000.000 - $2.000.000", "$2.000.000 - $4.000.000", "Más de $4.000.000", "Prefiero no decirlo"];
const EDUCATION_OPTIONS = ["Media incompleta o inferior", "Media completa", "Técnica Profesional", "Universitaria incompleta", "Universitaria completa", "Postgrado"];
const HOUSING_OPTIONS = ["Propia pagada", "Propia pagando (Dividendo)", "Arrendada", "Familiar / Compartida"];

const PURCHASE_BEHAVIOR_OPTIONS = ["Planificador", "Impulsivo", "Cazador de ofertas", "Basado en calidad/marca"];
const INFLUENCE_LEVEL_OPTIONS = ["Líder de opinión (recomiendo)", "Consultado a veces", "Sigo recomendaciones"];

const INPUT = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-600/10 outline-none transition-all font-medium text-slate-700";
const SELECT = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-600/10 transition-all font-bold text-slate-700";

function getInviteCodeFromGate(): string | null {
    const tokenId = accessGate.getTokenId();
    if (!tokenId) return null;

    const raw = tokenId.startsWith("CODE:") ? tokenId.slice(5) : tokenId;
    const code = raw.trim().toUpperCase();

    // si fuese UUID antiguo u otro formato raro, no sirve para bootstrap por código
    if (!code || code.length < 4 || code.includes("-") && code.length === 36) return null;

    return code;
}

function validateNickname(nick: string): string | null {
    const v = nick.trim();
    if (v.length < 3 || v.length > 18) return "Nickname debe tener entre 3 y 18 caracteres.";
    if (!/^[a-zA-Z0-9_-]+$/.test(v)) return 'Nickname solo puede usar letras, números, "_" o "-".';
    return null;
}

export default function ProfileWizard() {
    const { profile, refreshProfile } = useAuthContext();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const initialStage = profile?.demographics?.profileStage || 0;
    const startingStep = initialStage >= 4 ? 4 : initialStage + 1;

    const [step, setStep] = useState(startingStep);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<DemographicData>>({
        name: profile?.demographics?.name || "",
        birthYear: profile?.demographics?.birthYear || undefined,
        gender: profile?.demographics?.gender || "",
        region: profile?.demographics?.region || "",
        commune: profile?.demographics?.commune || "",
        employmentStatus: profile?.demographics?.employmentStatus || "",
        incomeRange: profile?.demographics?.incomeRange || "",
        educationLevel: profile?.demographics?.educationLevel || "",
        housingType: profile?.demographics?.housingType || "",
        purchaseBehavior: profile?.demographics?.purchaseBehavior || "",
        influenceLevel: profile?.demographics?.influenceLevel || ""
    });

    const [nicknameErr, setNicknameErr] = useState<string | null>(null);

    const submitStep = async (isSkip: boolean = false) => {
        setNicknameErr(null);
        setLoading(true);

        try {
            // STEP 1: Nickname + CLAIM INVITACIÓN + stage=1
            if (step === 1) {
                const nick = formData.name?.trim() || "";
                if (!nick) {
                    setNicknameErr("El Nickname es obligatorio.");
                    setLoading(false);
                    return;
                }

                const nickErr = validateNickname(nick);
                if (nickErr) {
                    setNicknameErr(nickErr);
                    setLoading(false);
                    return;
                }

                // 1) Ver si ya tiene invite amarrada
                const bs = await authService.getBootstrapStatus();

                if (!bs.hasInvite) {
                    const inviteCode = getInviteCodeFromGate();
                    if (!inviteCode) {
                        setNicknameErr("No encontramos tu código de invitación. Vuelve a /access e ingrésalo de nuevo.");
                        setLoading(false);
                        return;
                    }

                    // Claim real (marca invitation_codes.used_by_user_id + users.invitation_code_id)
                    await authService.bootstrapUserAfterSignup(nick, inviteCode);
                } else {
                    // Si ya tiene invite, solo setear nickname (una sola vez)
                    const { error: rpcErr } = await (supabase as any).rpc("set_nickname_once", {
                        p_nickname: nick,
                    });
                    if (rpcErr) throw rpcErr;
                }

                // 2) Alinear con backend: profile_stage >= 1 para poder emitir señales
                await authService.updateProfileDemographics({
                    profileStage: 1,
                    signalWeight: 1.0
                });

                await refreshProfile();
            } else {
                // Updates por etapa
                let payload: Partial<DemographicData> = {};

                if (step === 2) {
                    payload = {
                        birthYear: formData.birthYear,
                        gender: formData.gender,
                        region: formData.region,
                        commune: formData.commune,
                        profileStage: 2,
                        signalWeight: 1.0
                    };
                } else if (step === 3 && !isSkip) {
                    payload = {
                        employmentStatus: formData.employmentStatus,
                        incomeRange: formData.incomeRange,
                        educationLevel: formData.educationLevel,
                        housingType: formData.housingType,
                        profileStage: 3,
                        signalWeight: 1.5
                    };
                } else if (step === 4 && !isSkip) {
                    payload = {
                        purchaseBehavior: formData.purchaseBehavior,
                        influenceLevel: formData.influenceLevel,
                        profileStage: 4,
                        signalWeight: 1.7
                    };
                }

                if (Object.keys(payload).length > 0) {
                    await authService.updateProfileDemographics(payload);
                    await refreshProfile();
                }
            }

            if (isSkip || step === 4) {
                navigate("/");
            } else {
                setStep((s) => s + 1);
            }
        } catch (error: any) {
            logger.error("Error submitting step:", error);
            const errMsg = error.message || "";

            if (step === 1 && (errMsg.includes("unique constraint") || errMsg.toLowerCase().includes("duplicate") || errMsg.includes("Nickname ya definido"))) {
                setNicknameErr("El nickname ya está en uso o ya fue definido anteriormente.");
            } else if (step === 1 && (errMsg.includes("Nickname debe tener") || errMsg.includes("Nickname solo puede usar"))) {
                setNicknameErr(errMsg);
            } else if (step === 1 && errMsg.includes("INVITE")) {
                setNicknameErr("Código inválido / expirado / ya usado. Vuelve a /access e ingresa otro.");
            } else {
                showToast(errMsg || "Ocurrió un error al guardar tu perfil. Intenta nuevamente.", "error");
            }

            setLoading(false);
            return;
        }

        setLoading(false);
    };

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            navigate("/login");
        } catch (err) {
            logger.error(err);
        }
    };

    const isStep1Valid = !!(formData.name?.trim());
    const isStep2Valid = !!(formData.birthYear && formData.gender && formData.region && (formData.region !== "Metropolitana" || formData.commune));
    const isStep3Valid = !!(formData.employmentStatus && formData.incomeRange && formData.educationLevel && formData.housingType);
    const isStep4Valid = !!(formData.purchaseBehavior && formData.influenceLevel);

    const stepTitles = ["Activa tu señal", "Tu contexto importa", "Potencia tu señal", "Define tu influencia"];

    return (
        <AuthLayout
            title={
                <div>
                    <span className="text-xs font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full mb-4 inline-block">
                        Paso {step} de 4
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                        {stepTitles[step - 1]}
                    </h1>
                </div>
            }
            subtitle={
                <div className="flex flex-col gap-2 mt-2">
                    <span className="text-slate-500 font-medium">
                        {step === 1 && "Elige tu Nickname (anónimo) y activa tu cuenta con invitación."}
                        {step === 2 && "Saber de dónde y quién opina le da contexto a tus señales."}
                        {step === 3 && "Opcional: Detalla tu perfil sociodemográfico para entender mejor tu contexto."}
                        {step === 4 && "Opcional: Cuéntanos cómo consumes para perfilar mejor tu influencia."}
                    </span>
                </div>
            }
        >
            <div className="w-full">
                <AnimatePresence mode="wait">

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tu Nickname</label>
                                <input
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Elige un nickname (no tu nombre real)"
                                    className={INPUT}
                                    required
                                />
                                <p className="text-[11px] text-slate-400 ml-1 font-medium">Tu identidad real no se muestra. Usa un nickname único (3-18 caracteres).</p>
                                {nicknameErr && <p className="text-sm text-red-600 font-medium ml-1 mt-1">{nicknameErr}</p>}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Genial, {formData.name}</h2>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Año de Nacimiento</label>
                                <input
                                    type="number"
                                    min="1920"
                                    max="2010"
                                    value={formData.birthYear || ""}
                                    onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                                    placeholder="Ej. 1990"
                                    className={INPUT}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Identidad de Género</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "female", label: "Mujer" },
                                        { id: "male", label: "Hombre" },
                                        { id: "other", label: "Otro" }
                                    ].map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setFormData({ ...formData, gender: g.id })}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.gender === g.id ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"}`}
                                            type="button"
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Región</label>
                                <select
                                    value={formData.region || ""}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value, commune: "" })}
                                    className={SELECT}
                                >
                                    <option value="">Selecciona tu región...</option>
                                    {REGIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {formData.region === "Metropolitana" && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Comuna (RM)</label>
                                    <select
                                        value={formData.commune || ""}
                                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                        className={SELECT}
                                    >
                                        <option value="">Selecciona tu comuna...</option>
                                        {COMUNAS_SANTIAGO.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nivel Educacional</label>
                                <select value={formData.educationLevel || ""} onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {EDUCATION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Situación Laboral</label>
                                <select value={formData.employmentStatus || ""} onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {EMPLOYMENT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ingresos del Hogar</label>
                                <select value={formData.incomeRange || ""} onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {INCOME_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Situación de Vivienda</label>
                                <select value={formData.housingType || ""} onChange={(e) => setFormData({ ...formData, housingType: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {HOUSING_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Comportamiento de Compra</label>
                                <select value={formData.purchaseBehavior || ""} onChange={(e) => setFormData({ ...formData, purchaseBehavior: e.target.value })} className={SELECT}>
                                    <option value="">¿Cómo sueles comprar?</option>
                                    {PURCHASE_BEHAVIOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nivel de Influencia</label>
                                <select value={formData.influenceLevel || ""} onChange={(e) => setFormData({ ...formData, influenceLevel: e.target.value })} className={SELECT}>
                                    <option value="">¿Qué tanto influyes en otros?</option>
                                    {INFLUENCE_LEVEL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>

                <div className="flex flex-col gap-3 mt-10">
                    <div className="flex gap-4">
                        <button
                            onClick={() => submitStep(false)}
                            disabled={
                                (step === 1 && !isStep1Valid) ||
                                (step === 2 && !isStep2Valid) ||
                                (step === 3 && !isStep3Valid) ||
                                (step === 4 && !isStep4Valid) ||
                                loading
                            }
                            className="btn-primary w-full py-4 rounded-2xl font-black tracking-wider uppercase text-sm disabled:opacity-30 shadow-xl shadow-primary-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : step === 4 ? "Finalizar Configuración" : "Guardar y Continuar"}
                        </button>
                    </div>

                    {(step === 3 || step === 4) && (
                        <button
                            onClick={() => submitStep(true)}
                            disabled={loading}
                            className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold tracking-wide uppercase text-xs transition-all"
                        >
                            Saltar este paso por ahora (Ir al Inicio)
                        </button>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={handleSignOut}
                        className="text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        ¿No es tu cuenta? <span className="underline decoration-primary-200">Cerrar Sesión</span>
                    </button>
                </div>

            </div>
        </AuthLayout>
    );
}
