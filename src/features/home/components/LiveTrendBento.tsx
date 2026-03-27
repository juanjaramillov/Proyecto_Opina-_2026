

interface LiveTrendBentoProps {
  children: React.ReactNode;
  className?: string;
}

export function LiveTrendBento({ children, className = '' }: LiveTrendBentoProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group cursor-default ${className}`}>
      {children}
    </div>
  );
}
