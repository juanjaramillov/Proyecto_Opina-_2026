/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#F8F9FB",
                surface: "#FFFFFF",
                secondary: "#FFFFFF",
                surface2: "#F1F3F7",

                ink: "#0F172A",
                "text-primary": "#0F172A",
                "text-secondary": "#475569",
                "text-muted": "#64748B",

                stroke: "#E2E8F0",

                primary: "#6366F1",
                accent: "#22C55E",
                danger: "#EF4444",
                warning: "#F59E0B",
            },
            boxShadow: {
                card: "0 4px 14px rgba(0,0,0,0.06)",
                lift: "0 8px 24px rgba(0,0,0,0.08)",
                premium: "0 12px 40px rgba(37,99,235,0.25)",
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
