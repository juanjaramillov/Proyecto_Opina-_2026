/** @type {import('tailwindcss').Config} */
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

                // Unified Brand System
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                accent: "var(--primary)",

                danger: "#EF4444",
                warning: "#F59E0B",

                // Aurora mapped to brand primary for consistency
                aurora: {
                    primary: "#4f46e5",
                    secondary: "#818CF8",
                    accent: "#4338ca",
                    bg: "#FFFFFF",
                },
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(to right, #4f46e5, #10b981)',
            },
            boxShadow: {
                card: "0 4px 14px rgba(0,0,0,0.06)",
                lift: "0 8px 24px rgba(0,0,0,0.08)",
                premium: "0 12px 40px rgba(79, 70, 229, 0.25)", // Indigo shadow
                aurora: "0 10px 40px -10px rgba(79, 70, 229, 0.3)",
                glass: "0 8px 32px 0 rgba(79, 70, 229, 0.1)",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            maxWidth: {
                ws: "80rem",
            },
        },
    },
    plugins: [],
};
