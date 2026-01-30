import React from 'react';
import { motion } from 'framer-motion';

interface FeedCardProps {
    children: React.ReactNode;
    bgGradient?: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
    children,
    bgGradient = "bg-gradient-to-br from-indigo-500 to-purple-600"
}) => {
    return (
        <div className="h-[100dvh] w-full snap-start relative flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 ${bgGradient} opacity-20`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.5 }}
                className="relative w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center justify-center h-full"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default FeedCard;
