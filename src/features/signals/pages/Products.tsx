import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [scanning, setScanning] = useState(false);

    const handleScan = () => {
        setScanning(true);
        // Simulate scan delay
        setTimeout(() => {
            navigate("/product/1");
        }, 2500);
    };

    return (
        <div className="max-w-md mx-auto py-8 px-4 space-y-8 min-h-screen flex flex-col">

            {/* Header */}
            <div className="text-center space-y-2 mt-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface2 text-2xl shadow-sm mb-2">
                    📦
                </div>
                <h1 className="text-3xl font-bold text-ink">Escanear Producto</h1>
                <p className="text-text-secondary">
                    Apunta a un código de barras para ver la verdad.
                </p>
            </div>

            {/* Scanner Visual Area */}
            <div className="flex-1 flex flex-col justify-center">
                <div
                    className="relative aspect-[3/4] w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-surface group cursor-pointer"
                    onClick={!scanning ? handleScan : undefined}
                >
                    {/* Fake Camera Feed - Using a generic gradient/texture to look like a 'blur' camera if image fails */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                        {/* Optional: Add a subtle video element here if we had one, for now a static purposeful tech image */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                    </div>

                    {/* Scan Overlay UI */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">

                        <AnimatePresence mode="wait">
                            {!scanning ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="relative w-64 h-40"
                                >
                                    {/* Corners */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-lg drop-shadow-lg"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-lg drop-shadow-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-lg drop-shadow-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-lg drop-shadow-lg"></div>

                                    {/* Center Line */}
                                    <motion.div
                                        className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                        animate={{ y: [-20, 20, -20] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />

                                    <div className="absolute -bottom-12 left-0 right-0 text-center">
                                        <span className="inline-block px-4 py-2 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold uppercase tracking-widest border border-white/10">
                                            Toca para escanear
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-primary animate-spin"></div>
                                    <div className="text-white font-bold text-lg tracking-wide">Analizando señal...</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls (Visual only) */}
                    <div className="absolute bottom-8 inset-x-0 flex justify-center gap-8 text-white/50 z-20">
                        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur transition-colors">⚡</button>
                        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur transition-colors">🔍</button>
                    </div>
                </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-surface rounded-2xl p-4 border border-stroke shadow-card">
                <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2 text-center">
                    ¿Problemas con la cámara?
                </div>
                <div className="flex gap-2">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ingresa código de barras manual"
                        className="flex-1 bg-surface2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-center font-mono text-sm outline-none transition-all placeholder:text-text-muted/50"
                    />
                    <button
                        onClick={() => navigate("/product/1")}
                        className="bg-primary text-white rounded-xl px-4 font-bold shadow-lift hover:scale-105 transition-transform"
                    >
                        →
                    </button>
                </div>
            </div>

        </div>
    );
}
