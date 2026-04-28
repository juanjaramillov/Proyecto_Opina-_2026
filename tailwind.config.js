/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
                headline: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                label: ['Inter', 'sans-serif'],
            },
            colors: {
                // ==========================================
                // 1. BRAND (Familia Canónica de Marca)
                // ==========================================
                brand: {
                    ...colors.blue,
                    DEFAULT: '#2563EB', // Blue 600
                },
                // NOTA: `primary` (scalar) se retiró en DEBT-009 · Fase 4.2.
                // Todas las clases `bg-primary`/`text-primary`/... se migraron
                // a `brand`. El CSS var `var(--primary)` sigue disponible en
                // `:root` para cualquier referencia legacy fuera de Tailwind.

                // ==========================================
                // 2. ACCENT (Familia Canónica de Énfasis)
                // ==========================================
                accent: {
                    ...colors.emerald,
                    DEFAULT: '#10B981', // Emerald 500
                    alt: '#0EA5E9',     // Sky 500
                },
                // NOTA: `secondary` (scalar) se retiró en DEBT-009 · Fase 4.2.
                // Todas las clases `bg-secondary`/... se migraron a `accent`.

                // ==========================================
                // 3. SURFACE (Familia Canónica de Contenedores)
                // ==========================================
                surface: {
                    DEFAULT: '#FFFFFF', // [SUBNIVEL OFICIAL] Surface Nivel 1 (Backgrounds principales)
                },
                surface2: "var(--surface2)", // [SUBNIVEL OFICIAL] Surface Nivel 2 (Tarjetas/Contenedores secundarios)
                bg: '#FFFFFF', // [LEGACY ALIAS] Equivalente a surface.DEFAULT

                // ==========================================
                // 4. INK (Familia Canónica de Texto)
                // ==========================================
                ink: {
                    DEFAULT: "var(--ink)", // [SUBNIVEL OFICIAL] Tinta principal
                    muted: "#64748B",      // [SUBNIVEL OFICIAL] slate-500
                },
                // NOTA: `text-primary`/`text-secondary`/`text-muted` se retiraron en
                // DEBT-009 · Fase 4.2. Todas las clases `text-text-*` migraron a
                // `text-slate-*` (mismo valor) o `text-ink`/`text-ink-muted`.

                // ==========================================
                // 5. LINE (Familia Canónica de Bordes/Divisores)
                // ==========================================
                line: {
                    DEFAULT: "var(--stroke)", // [SUBNIVEL OFICIAL] Línea base
                },
                stroke: "var(--stroke)", // [LEGACY ALIAS] Equivalente a line.DEFAULT

                // ==========================================
                // 6. STATUS (Familia Canónica de Retroalimentación)
                // ==========================================
                // Escalas completas para permitir matices semánticos (danger-50 fondo suave, danger-600 texto, etc.)
                danger: {
                    ...colors.red,
                    DEFAULT: '#EF4444', // Red 500
                },
                warning: {
                    ...colors.amber,
                    DEFAULT: '#F59E0B', // Amber 500
                },
                success: {
                    ...colors.emerald,
                    DEFAULT: '#10B981', // Emerald 500 (alias semántico de accent)
                },

            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(to right, #2563EB, #10b981)',
            },
            boxShadow: {
                // ==========================================
                // ELEVACIÓN CANÓNICA (3 niveles + glass)
                // Cualquier shadow-[...] arbitrario debe mapear acá.
                // ==========================================
                card:    "0 4px 14px rgba(0,0,0,0.06)",
                lift:    "0 8px 24px rgba(0,0,0,0.08)",
                premium: "0 20px 40px rgba(0,0,0,0.10)",
                glass:   "0 8px 32px rgba(0,0,0,0.06)",            // GlassCard

                // Glow effects para CTAs gradient y heroes animados
                'glow-brand':  "0 0 16px rgba(37,99,235,0.40)",
                'glow-accent': "0 0 16px rgba(16,185,129,0.40)",
                // Glow más intenso para botones primarios sobre dark areas
                'glow-brand-lg':  "0 10px 28px rgba(37,99,235,0.30)",

                // Sombra "papel": label flotante con drop sombra + borde superior brilloso.
                // Usada en etiquetas flotantes del Home.
                paper: "0 10px 20px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,1)",

                // Sombras "papel premium" con tint brand/accent — cards heroicas con
                // halo del color corporativo. Usadas en WhatIsOpinaSection y similares.
                'paper-brand':  "inset 0 -10px 20px rgba(0,0,0,0.04), inset 0 4px 10px rgba(255,255,255,1), 0 20px 40px rgba(37,99,235,0.10)",
                'paper-accent': "inset 0 -10px 20px rgba(0,0,0,0.04), inset 0 4px 10px rgba(255,255,255,1), 0 20px 40px rgba(16,185,129,0.10)",
                'paper-brand-sm':  "inset 0 -8px 16px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,1), 0 20px 40px rgba(37,99,235,0.15)",
                'paper-accent-sm': "inset 0 -8px 16px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,1), 0 20px 40px rgba(16,185,129,0.15)",
            },
            borderRadius: {
                // ==========================================
                // RADIOS CANÓNICOS
                // ==========================================
                xl:    "1rem",     // 16px
                "2xl": "1.25rem",  // 20px
                "3xl": "1.5rem",   // 24px
                "4xl": "2rem",     // 32px — heroes, cards grandes
                "5xl": "2.5rem",   // 40px — option cards, contenedores destacados
                "6xl": "3rem",     // 48px — phone mockups, frames de showcase
            },
            maxWidth: {
                ws: "100rem",
            },
            keyframes: {
                // ==========================================
                // ANIMACIONES CANÓNICAS
                // Cualquier animate-[...] inline debe mapear acá.
                // ==========================================
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':       { transform: 'translateY(-8px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '0.6' },
                    '50%':       { opacity: '1' },
                },
                'fade-up': {
                    'from': { opacity: '0', transform: 'translateY(14px)' },
                    'to':   { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'float-slow':  'float-slow 6s ease-in-out infinite',
                'ping-slow':   'ping 3s cubic-bezier(0,0,0.2,1) infinite',
                'ping-slower': 'ping 4s cubic-bezier(0,0,0.2,1) infinite',
                'bounce-slow': 'bounce 3s ease-in-out infinite',
                'bounce-slower': 'bounce 4s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
                'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
                'fade-up':    'fade-up 0.5s ease-out both',
            },
        },
    },
    plugins: [],
};
