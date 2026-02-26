import { motion } from 'framer-motion';
import { BattleOption } from '../../types';

interface CrownedWinnerProps {
    champion: BattleOption;
    totalRounds: number;
    onPlayAgain: () => void;
    onExit: () => void;
}

export default function CrownedWinner({ champion, totalRounds, onPlayAgain, onExit }: CrownedWinnerProps) {
    return (
        <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center p-8 rounded-[3.5rem] bg-gradient-to-b from-amber-50 to-white relative overflow-hidden shadow-inner border border-amber-100">
            {/* Background Decorations */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/30 blur-[100px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-200/30 blur-[100px] rounded-full pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative z-10 flex flex-col items-center w-full max-w-md text-center"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="w-48 h-48 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border border-amber-100 overflow-hidden p-8"
                    >
                        {champion.image_url ? (
                            <img src={champion.image_url} alt={champion.label} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                            <span className="material-symbols-outlined text-6xl text-amber-500">stars</span>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0, y: -50 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                        className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    >
                        <span className="material-symbols-outlined text-4xl">crown</span>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <span className="px-4 py-1.5 bg-amber-100 text-amber-700 font-black text-xs uppercase tracking-widest rounded-full">
                        Torneo Finalizado
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 mt-6 mb-2 tracking-tight">
                        ¡Campeón Coronado!
                    </h2>
                    <p className="text-lg text-slate-500 mb-2">
                        Dominó la arena y alcanzó las 5 victorias. <br />
                        <span className="text-sm">El torneo se definió tras <b>{totalRounds}</b> intensas rondas.</span>
                    </p>
                    <p className="text-3xl font-black text-amber-600 mb-10 leading-tight">
                        {champion.label}
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                >
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
                    >
                        Jugar otro torneo
                    </button>
                    <button
                        onClick={onExit}
                        className="flex-1 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        Volver al Hub
                    </button>
                </motion.div>
            </motion.div>

            {/* Confetti Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                        left: "50%",
                        top: "30%",
                        backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#6366f1'][i % 4]
                    }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                        x: (Math.random() - 0.5) * 800,
                        y: (Math.random() - 0.5) * 800 + 200, // fall down
                        opacity: 0,
                        rotate: Math.random() * 360
                    }}
                    transition={{ duration: 2.5 + Math.random(), delay: 0.2 + (Math.random() * 0.5), ease: "easeOut" }}
                />
            ))}
        </div>
    );
}
