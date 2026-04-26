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
                card: "0 4px 14px rgba(0,0,0,0.06)",
                lift: "0 8px 24px rgba(0,0,0,0.08)",
                premium: "0 20px 40px rgba(0, 0, 0, 0.10)", // Consistent premium shadow
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            maxWidth: {
                ws: "100rem",
            },
        },
    },
    plugins: [],
};
