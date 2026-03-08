/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#FFFFFF",
                surface: "#FFFFFF",
                surface2: "var(--surface2)",

                ink: "var(--ink)",
                "text-primary": "var(--ink)",
                "text-secondary": "#475569",
                "text-muted": "#64748B",

                stroke: "var(--stroke)",

                // Resto del color del sistema ya importado por Tailwind, no sobreescribir los default de indigo o violet.

                // Unified Brand System (using full palettes)
                primary: {
                    ...colors.blue,
                    DEFAULT: '#2563EB', // Opina+ Brand Blue
                    600: '#2563EB',
                },
                secondary: {
                    ...colors.emerald,
                    DEFAULT: '#10B981', // emerald-500
                },
                accent: {
                    ...colors.sky,
                    DEFAULT: '#0EA5E9',
                },

                danger: "#EF4444",
                warning: "#F59E0B",


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
