import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDemoData } from '../../../demo/DemoContext';

const HomeB2BSection: React.FC = () => {
    const { stats } = useDemoData();

    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Para empresas
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Señal para <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">decisiones reales</span>
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        Panel en vivo, segmentación profunda y tendencias accionables para tu marca.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {/* Card 1 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800/80 transition-all hover:border-indigo-500/30"
                    >
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                            <span className="material-symbols-outlined text-2xl">monitoring</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Tendencias en tiempo real</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Detecta cambios en el comportamiento del consumidor antes de que sean masivos.
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800/80 transition-all hover:border-indigo-500/30"
                    >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                            <span className="material-symbols-outlined text-2xl">group_work</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Segmentación por perfil</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Filtra señales por edad, ubicación y lealtad para entender a tu audiencia objetivo.
                        </p>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800/80 transition-all hover:border-indigo-500/30"
                    >
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                            <span className="material-symbols-outlined text-2xl">notifications_active</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Comparativos y alertas</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Recibe notificaciones cuando tu marca o competidores cambien de sentimiento.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => alert('Demo solicitada (Mock)')}
                            className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-all shadow-lg hover:scale-105"
                        >
                            Solicitar demo
                        </button>
                        <Link
                            to="/trends"
                            className="px-8 py-4 bg-transparent border border-slate-700 text-white font-bold rounded-full hover:bg-slate-800 transition-all hover:border-slate-500"
                        >
                            Ver dashboard
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest opacity-80">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {stats.totalVotes.toLocaleString('es-CL')} señales hoy • 4 segmentos • 3 alertas activas
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeB2BSection;
