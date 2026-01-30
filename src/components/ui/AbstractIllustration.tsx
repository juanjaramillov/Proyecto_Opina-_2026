import { useRef, useEffect } from "react";

type Props = {
    intensity?: number;
    type?: "points" | "lines" | "mixed";
    className?: string;
};

export default function AbstractIllustration({ intensity = 1, type = "points", className = "" }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: { x: number; y: number; vx: number; vy: number; s: number }[] = [];
        let animationFrameId: number;
        let w = canvas.width = canvas.offsetWidth;
        let h = canvas.height = canvas.offsetHeight;

        const init = () => {
            particles = [];
            const count = Math.floor(50 * intensity);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.2, // Very slow drift
                    vy: (Math.random() - 0.5) * 0.2,
                    s: Math.random() * 2 + 1, // Size
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "rgba(79, 70, 229, 0.4)"; // Primary color, low opacity
            ctx.strokeStyle = "rgba(79, 70, 229, 0.1)";

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                // Draw point
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby points (if mixed or lines)
                if (type !== "points") {
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            ctx.lineWidth = 1 - (dist / 100);
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            });
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
            init();
        };

        window.addEventListener('resize', handleResize);
        init();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [intensity, type]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none opacity-50 ${className}`}
        />
    );
}
