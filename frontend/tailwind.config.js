/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "cyber-bg": "#050805",
                "spring-green": "#00FF66",
                "emerald-dark": "#0A2010",
                "emerald-glow": "#008F5A",
                "glass-white": "rgba(255, 255, 255, 0.03)",
                "glass-green": "rgba(0, 255, 102, 0.05)",
                "cyber-black": "#050805",
            },
            fontFamily: {
                sans: ["Inter", "Space Grotesk", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                'neon': '0 0 15px rgba(0, 255, 102, 0.4)',
                'neon-strong': '0 0 25px rgba(0, 255, 102, 0.6)',
            },
            backgroundImage: {
                'cyber-grid': "linear-gradient(rgba(0, 255, 102, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 102, 0.05) 1px, transparent 1px)",
            }
        },
    },
    plugins: [],
}
