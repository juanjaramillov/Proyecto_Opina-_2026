import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex-1 w-full min-h-[calc(100vh-180px)] bg-white flex flex-col items-center justify-center p-6 relative">

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-brand mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                            <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>

                    {typeof title === 'string' ? (
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{title}</h1>
                    ) : (
                        title
                    )}

                    {subtitle && (
                        typeof subtitle === 'string' ? (
                            <p className="text-slate-500 font-medium">{subtitle}</p>
                        ) : (
                            subtitle
                        )
                    )}
                </div>

                <div className="bg-white">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
