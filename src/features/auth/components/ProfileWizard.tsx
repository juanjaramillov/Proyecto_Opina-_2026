import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { DemographicData } from "../types";
import { useToast } from "../../../components/ui/useToast";
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

export default function ProfileWizard() {
    const { profile, refreshProfile } = useAuthContext();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Initialize starting step based on backend data if available, otherwise step 1
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

    const submitStep = async (isSkip: boolean = false) => {
        setLoading(true);
        try {
            // Determine the stage properties to save based on the current step
            let payload: Partial<DemographicData> = {};
            if (step === 1) {
                payload = {
                    name: formData.name,
                    birthYear: formData.birthYear,
                    gender: formData.gender,
                    profileStage: 1,
                    signalWeight: 1.0
                };
            } else if (step === 2) {
                payload = {
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

            // Only update backend if there is data to update (not entirely skipping without changes)
            if (Object.keys(payload).length > 0) {
                await authService.updateProfileDemographics(payload);
                await refreshProfile();
            }

            if (isSkip || step === 4) {
                navigate("/"); // Done or skipped optional
            } else {
                setStep(s => s + 1);
            }

        } catch (error: any) {
            logger.error("Error submitting step:", error);
            showToast(error.message || "Ocurrió un error al guardar tu perfil. Intenta nuevamente.", "error");
            setLoading(false);
            return; // Detener avance
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

    const isStep1Valid = !!(formData.name?.trim() && formData.birthYear && formData.gender);
    const isStep2Valid = !!(formData.region && (formData.region !== "Metropolitana" || formData.commune));
    const isStep3Valid = !!(formData.employmentStatus && formData.incomeRange && formData.educationLevel && formData.housingType);
    const isStep4Valid = !!(formData.purchaseBehavior && formData.influenceLevel);

    const stepTitles = [
        "Activa tu señal",
        "Tu contexto importa",
        "Potencia tu señal",
        "Define tu influencia"
    ];

    return (
        <AuthLayout
            title={
                < div >
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">
                        Paso {step} de 4
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                        {stepTitles[step - 1]}
                    </h1>
                </div >
            }
            subtitle={
                < div className="flex flex-col gap-2 mt-2" >
                    <span className="text-slate-500 font-medium">
                        {step === 1 && "Ingresa tus datos básicos para comenzar a opinar."}
                        {step === 2 && "Saber de dónde opinas le da contexto a tus señales."}
                        {step === 3 && "Opcional: Detalla tu perfil sociodemográfico para entender mejor tu contexto."}
                        {step === 4 && "Opcional: Cuéntanos cómo consumes para perfilar mejor tu influencia."}
                    </span>
                </div >
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
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 ml-1 font-medium">Tu identidad real no se muestra. Usa un nickname.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Año de Nacimiento</label>
                                <input
                                    type="number"
                                    min="1920"
                                    max="2010"
                                    value={formData.birthYear || ""}
                                    onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                                    placeholder="Ej. 1990"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
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
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.gender === g.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"}`}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Genial, {formData.name}</h2>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Región</label>
                                <select
                                    value={formData.region || ""}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value, commune: "" })}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700"
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
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700"
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
                                <select value={formData.educationLevel || ""} onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 text-sm">
                                    <option value="">Seleccionar...</option>
                                    {EDUCATION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Situación Laboral</label>
                                <select value={formData.employmentStatus || ""} onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 text-sm">
                                    <option value="">Seleccionar...</option>
                                    {EMPLOYMENT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ingresos del Hogar</label>
                                <select value={formData.incomeRange || ""} onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 text-sm">
                                    <option value="">Seleccionar...</option>
                                    {INCOME_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Situación de Vivienda</label>
                                <select value={formData.housingType || ""} onChange={(e) => setFormData({ ...formData, housingType: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 text-sm">
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
                                <select value={formData.purchaseBehavior || ""} onChange={(e) => setFormData({ ...formData, purchaseBehavior: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700">
                                    <option value="">¿Cómo sueles comprar?</option>
                                    {PURCHASE_BEHAVIOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nivel de Influencia</label>
                                <select value={formData.influenceLevel || ""} onChange={(e) => setFormData({ ...formData, influenceLevel: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700">
                                    <option value="">¿Qué tanto influyes en otros?</option>
                                    {INFLUENCE_LEVEL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center">
                                <h3 className="font-black text-slate-900 text-xl mb-2">Conviértete en Usuario Verificado</h3>
                                <p className="text-slate-600 font-medium mb-4 text-sm">Verifica tu identidad con tu Cédula para desbloquear el máximo nivel de influencia en Opina+.</p>
                                <button type="button" className="w-full py-4 bg-amber-100 text-amber-800 rounded-2xl font-bold border-2 border-amber-300 hover:bg-amber-200 transition-colors">
                                    Verificar Identidad (Próximamente)
                                </button>
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
                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black tracking-wider uppercase text-sm transition-all disabled:opacity-30 shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    "Guardando..."
                                </>
                            ) : step === 4 ? "Finalizar Configuración" : "Guardar y Continuar"}
                        </button>
                    </div>

                    {(step === 3 || step === 4) && (
                        <button
                            onClick={() => submitStep(true)}
                            disabled={loading}
                            className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold tracking-wide uppercase text-xs transition-all"
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
                        ¿No es tu cuenta? <span className="underline decoration-indigo-200">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </AuthLayout >
    );
}
