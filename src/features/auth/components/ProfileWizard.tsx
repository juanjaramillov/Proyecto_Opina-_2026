import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";

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

export default function ProfileWizard() {
    const { refreshProfile } = useAuthContext();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        ageRange: "",
        gender: "",
        comuna: "",
        healthSystem: "",
        clinicalAttention12m: null as boolean | null
    });

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await authService.updateProfileDemographics({
                name: formData.name,
                ageRange: formData.ageRange,
                gender: formData.gender,
                region: "Metropolitana",
                comuna: formData.comuna,
                healthSystem: formData.healthSystem,
                clinicalAttention12m: formData.clinicalAttention12m === true
            });

            await refreshProfile();
            navigate("/"); // Redirigir al Home tras completar
        } catch (error) {
            console.error("Error completing profile:", error);
        }
        setLoading(false);
    };

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            navigate("/login");
        } catch (err) {
            console.error("Error signing out from wizard:", err);
        }
    };

    const isStep1Valid = formData.name.trim().length > 0 && formData.ageRange && formData.gender;
    const isStep2Valid = formData.comuna && formData.healthSystem;
    const isStep3Valid = formData.clinicalAttention12m !== null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white">
            <div className="max-w-xl w-full bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 p-10 border border-white overflow-hidden relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <div className="mb-10 text-center">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                        Paso {step} de 3
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 mt-4 tracking-tight">
                        {step === 1 && "Comencemos con lo básico"}
                        {step === 2 && "Ubicación y Salud"}
                        {step === 3 && "Último detalle"}
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Esta información es vital para segmentar las señales correctamente.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="¿Cómo te llamas?"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Rango de Edad</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["18–29", "30–45", "46–60", "60+"].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setFormData({ ...formData, ageRange: range })}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.ageRange === range ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"}`}
                                        >
                                            {range} años
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Género</label>
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
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Hola {formData.name},</h2>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Comuna de Residencia (RM)</label>
                                <select
                                    value={formData.comuna}
                                    onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700"
                                >
                                    <option value="">Selecciona tu comuna...</option>
                                    {COMUNAS_SANTIAGO.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sistema Previsional</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Isapre", "Fonasa"].map(sys => (
                                        <button
                                            key={sys}
                                            onClick={() => setFormData({ ...formData, healthSystem: sys })}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.healthSystem === sys ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"}`}
                                        >
                                            {sys}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-6 bg-indigo-50 p-6 rounded-[24px] border border-indigo-100 text-center">
                                <p className="text-indigo-900 font-bold leading-relaxed">
                                    ¿Has asistido a una consulta médica o te has realizado algún examen clínico en los últimos 12 meses?
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setFormData({ ...formData, clinicalAttention12m: true })}
                                        className={`flex-1 p-5 rounded-[20px] border-2 transition-all font-black text-lg ${formData.clinicalAttention12m === true ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-white text-slate-400 hover:border-indigo-100"}`}
                                    >
                                        SÍ
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, clinicalAttention12m: false })}
                                        className={`flex-1 p-5 rounded-[20px] border-2 transition-all font-black text-lg ${formData.clinicalAttention12m === false ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white border-white text-slate-400 hover:border-indigo-100"}`}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-4 mt-12">
                    {step > 1 && (
                        <button
                            onClick={handlePrev}
                            className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            Atrás
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                            className="flex-[2] py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-30 shadow-xl shadow-slate-100 active:scale-[0.98]"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!isStep3Valid || loading}
                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all disabled:opacity-30 shadow-xl shadow-indigo-100 active:scale-[0.98]"
                        >
                            {loading ? "Finalizando..." : "Completar mi Perfil"}
                        </button>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                    <button
                        onClick={handleSignOut}
                        className="text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        ¿No es tu cuenta? <span className="underline decoration-indigo-200">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
