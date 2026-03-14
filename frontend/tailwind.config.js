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
                primary: {
                    light: '#6366f1',
                    DEFAULT: '#4f46e5',
                    dark: '#4338ca',
                },
                secondary: {
                    light: '#f43f5e',
                    DEFAULT: '#e11d48',
                    dark: '#be123c',
                },
                accent: {
                    light: '#fbbf24',
                    DEFAULT: '#f59e0b',
                    dark: '#d97706',
                },
                dark: {
                    lighter: '#374151',
                    DEFAULT: '#1f2937',
                    darker: '#111827',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
