import { useState } from "react";
import { supabase } from "../../../supabase/client";

export default function CheckEmail({ email }: { email: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const resend = async () => {
        setErr(null);
        setMsg(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email,
            });
            if (error) throw error;
            setMsg("Listo. Te reenviamos el correo de confirmación.");
        } catch (e: any) {
            setErr(e?.message ?? "No se pudo reenviar el correo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h1 className="text-xl font-black text-slate-900">Revisa tu email</h1>
                <p className="text-sm text-slate-600 font-medium mt-2">
                    Te enviamos un correo a <span className="font-black">{email}</span> para confirmar tu cuenta.
                    Después vuelve e inicia sesión.
                </p>

                {err && <p className="text-sm text-red-600 font-medium mt-4">{err}</p>}
                {msg && <p className="text-sm text-slate-800 font-medium mt-4">{msg}</p>}

                <button
                    onClick={resend}
                    disabled={loading}
                    className="w-full mt-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    {loading ? "Reenviando..." : "Reenviar correo"}
                </button>

                <p className="text-xs text-slate-500 mt-4">
                    Si no aparece, revisa Spam/Promociones.
                </p>
            </div>
        </div>
    );
}
