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
                primary: '#2563EB', // [LEGACY ALIAS] Equivalente histórico a brand.DEFAULT

                // ==========================================
                // 2. ACCENT (Familia Canónica de Énfasis)
                // ==========================================
                accent: {
                    ...colors.emerald,
                    DEFAULT: '#10B981', // Emerald 500
                    alt: '#0EA5E9',     // Sky 500
                },
                secondary: '#10B981', // [LEGACY ALIAS] Equivalente histórico a accent.DEFAULT

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
                // Aliases legacy permitidos por compatibilidad:
                "text-primary": "var(--ink)",
                "text-secondary": "#475569", // slate-600
                "text-muted": "#64748B",     // Equivalente a ink-muted

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
                danger: "#EF4444",
                warning: "#F59E0B",
                success: "#10B981",

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
