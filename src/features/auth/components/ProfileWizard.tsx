import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { DemographicData } from "../types";
import { useToast } from "../../../components/ui/useToast";
import { SEG_REGIONS } from "../../../lib/segmentation";
import { normalizeRegion } from "../../../lib/demographicsNormalize";
import { track, trackPage } from "../../telemetry/track";
import { useEffect } from "react";

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
const HOUSEHOLD_SIZE_OPTIONS = ["1 persona", "2 personas", "3 personas", "4 personas", "5 o más personas"];
const CHILDREN_COUNT_OPTIONS = ["No tengo hijos", "1 hijo", "2 hijos", "3 o más hijos"];
const CAR_COUNT_OPTIONS = ["Sin auto", "1 auto", "2 autos", "3 o más autos"];

const INPUT = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-600/10 outline-none transition-all font-medium text-slate-700";
const SELECT = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-600/10 transition-all font-bold text-slate-700";

// Nickname validation moved to Register.tsx

export default function ProfileWizard() {
    const { profile, refreshProfile } = useAuthContext();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const initialStage = profile?.demographics?.profileStage || 0;
    const startingStep = initialStage >= 4 ? 4 : initialStage + 1;

    const [step, setStep] = useState(startingStep);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        trackPage("profile_wizard", { step });
    }, [step]);

    const [formData, setFormData] = useState<Partial<DemographicData>>({
        name: profile?.demographics?.name || "",
        birthYear: profile?.demographics?.birthYear || undefined,
        gender: profile?.demographics?.gender || "",
        region: normalizeRegion(profile?.demographics?.region || "") || "",
        commune: profile?.demographics?.commune || "",
        employmentStatus: profile?.demographics?.employmentStatus || "",
        incomeRange: profile?.demographics?.incomeRange || "",
        educationLevel: profile?.demographics?.educationLevel || "",
        householdSize: profile?.demographics?.householdSize || "",
        childrenCount: profile?.demographics?.childrenCount || "",
        carCount: profile?.demographics?.carCount || ""
    });

    const submitStep = async (isSkip: boolean = false) => {
        setLoading(true);

        try {
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
                    profileStage: 3,
                    signalWeight: 1.5
                };
            } else if (step === 4 && !isSkip) {
                payload = {
                    householdSize: formData.householdSize,
                    childrenCount: formData.childrenCount,
                    carCount: formData.carCount,
                    profileStage: 4,
                    signalWeight: 1.8
                };
            }

            if (Object.keys(payload).length > 0) {
                await authService.updateProfileDemographics(payload);
                track("profile_wizard_step_completed", "info", { step, isSkip, profile_stage: (payload as any).profileStage });
                await refreshProfile();
            }

            if (isSkip || step === 4) {
                track("profile_wizard_completed", "info", { final_step: step, isSkip });
                navigate("/");
            } else {
                setStep((s) => s + 1);
            }
        } catch (error: any) {
            logger.error("Error submitting step:", error);
            const errMsg = error.message || "";

            if (step === 1 && (errMsg.includes("unique constraint") || errMsg.toLowerCase().includes("duplicate") || errMsg.includes("Nickname ya definido"))) {
                showToast("El nickname ya está en uso o ya fue definido anteriormente.", "error");
            } else if (step === 1 && (errMsg.includes("Nickname debe tener") || errMsg.includes("Nickname solo puede usar"))) {
                showToast(errMsg, "error");
            } else if (step === 1 && errMsg.includes("INVITE")) {
                showToast("Código inválido / expirado / ya usado. Vuelve a /access e ingresa otro.", "error");
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

    const isStep2Valid = !!(formData.birthYear && formData.gender && formData.region && (formData.region !== "RM" || formData.commune));
    const isStep3Valid = !!(formData.employmentStatus && formData.incomeRange && formData.educationLevel);
    const isStep4Valid = !!(formData.householdSize && formData.childrenCount && formData.carCount);

    return (
        <AuthLayout
            title={
                <div>
                    <span className="text-xs font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full mb-4 inline-block">
                        Sube el peso de tu señal • Paso {step} de 4
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                        Tu perfil (versión corta)
                    </h1>
                </div>
            }
            subtitle={
                <div className="flex flex-col gap-2 mt-2">
                    <span className="text-slate-500 font-medium">
                        Mientras más completo, más pesa tu señal. Sin drama.
                    </span>
                </div>
            }
        >
            <div className="w-full">
                <AnimatePresence mode="wait">


                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Genial, {formData.name}</h2>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Edad</label>
                                <input
                                    type="number"
                                    min="1920"
                                    max="2010"
                                    value={formData.birthYear || ""}
                                    onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                                    placeholder="Ej. 1990"
                                    className={INPUT}
                                />
                                <p className="text-[11px] text-slate-400 ml-1 mt-[-4px] font-medium">Para segmentar tendencias. No para juzgarte.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Género</label>
                                <p className="text-[11px] text-slate-400 ml-1 mt-[-4px] font-medium">Opcional. Pero ayuda a leer mejor la data.</p>
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">¿Dónde estás?</label>
                                <p className="text-[11px] text-slate-400 ml-1 mt-[-4px] font-medium">Tranquilo: solo usamos esto para segmentar.</p>
                                <select
                                    value={formData.region || ""}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value, commune: "" })}
                                    className={SELECT}
                                >
                                    <option value="">Selecciona…</option>
                                    {SEG_REGIONS.filter(r => r.value !== "all").map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.region === "RM" && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Comuna (RM)</label>
                                    <select
                                        value={formData.commune || ""}
                                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                        className={SELECT}
                                    >
                                        <option value="">Selecciona…</option>
                                        {COMUNAS_SANTIAGO.map((c: string) => <option key={c} value={c}>{c}</option>)}
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
                                    {EDUCATION_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Situación Laboral</label>
                                <select value={formData.employmentStatus || ""} onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {EMPLOYMENT_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ingresos del Hogar</label>
                                <select value={formData.incomeRange || ""} onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })} className={SELECT}>
                                    <option value="">Seleccionar...</option>
                                    {INCOME_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Contexto de Hogar</h2>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Personas en el hogar</label>
                                <select value={formData.householdSize || ""} onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })} className={SELECT}>
                                    <option value="">¿Cuántos viven contigo?</option>
                                    {HOUSEHOLD_SIZE_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hijos</label>
                                <select value={formData.childrenCount || ""} onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })} className={SELECT}>
                                    <option value="">¿Tienes hijos?</option>
                                    {CHILDREN_COUNT_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Autos en el hogar</label>
                                <select value={formData.carCount || ""} onChange={(e) => setFormData({ ...formData, carCount: e.target.value })} className={SELECT}>
                                    <option value="">¿Cuántos autos tienen?</option>
                                    {CAR_COUNT_OPTIONS.map((c: string) => <option key={c} value={c}>{c}</option>)}
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
                            ) : step === 4 ? "Listo" : "Guardar y seguir"}
                        </button>
                    </div>

                    {(step === 3 || step === 4) && (
                        <button
                            onClick={() => submitStep(true)}
                            disabled={loading}
                            className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold tracking-wide uppercase text-xs transition-all"
                        >
                            Ahora no
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
