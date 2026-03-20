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
                headline: ['"Plus Jakarta Sans"', 'sans-serif'],
                body: ['"Plus Jakarta Sans"', 'sans-serif'],
                label: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                "surface-container-high": "#e6e8ea",
                "primary-fixed": "#dee0ff",
                "on-secondary-container": "#00714d",
                "on-error-container": "#93000a",
                "outline-variant": "#c5c5d4",
                "on-surface-variant": "#454652",
                "on-tertiary-fixed": "#23005c",
                "primary-container": "#3f51b5",
                "surface-dim": "#d8dadc",
                "on-tertiary-fixed-variant": "#5516be",
                "on-primary-container": "#cacfff",
                "surface-tint": "#4355b9",
                "surface-variant": "#e0e3e5",
                "surface-container-lowest": "#ffffff",
                "secondary-fixed": "#6ffbbe",
                "surface-container-highest": "#e0e3e5",
                "on-tertiary-container": "#dbcaff",
                "surface-b2c": "#f7f9fb", // Renamed to avoid breaking current 'surface'
                "error-container": "#ffdad6",
                "surface-container-low": "#f2f4f6",
                "tertiary": "#510cba",
                "on-secondary-fixed-variant": "#005236",
                "error": "#ba1a1a",
                "on-secondary": "#ffffff",
                "on-surface": "#191c1e",
                "secondary-container": "#6cf8bb",
                "primary-fixed-dim": "#bac3ff",
                "on-secondary-fixed": "#002113",
                "on-primary": "#ffffff",
                "on-error": "#ffffff",
                "tertiary-fixed-dim": "#d0bcff",
                "inverse-primary": "#bac3ff",
                "outline-b2c": "#757684", // Renamed 'outline'
                "on-primary-fixed": "#00105c",
                "background-b2c": "#f7f9fb", // Renamed 'background'
                "inverse-surface": "#2d3133",
                "primary-b2c": "#24389c", // Renamed 'primary' to primary-b2c
                "on-primary-fixed-variant": "#293ca0",
                "secondary-fixed-dim": "#4edea3",
                "on-tertiary": "#ffffff",
                "surface-container": "#eceef0",
                "inverse-on-surface": "#eff1f3",
                "secondary-b2c": "#006c49", // Renamed 'secondary'
                "on-background": "#191c1e",
                "tertiary-fixed": "#e9ddff",
                "tertiary-container": "#6935d2",
                "surface-bright": "#f7f9fb",
                
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
