/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                sm: "100%",
                md: "100%",
                lg: "100%",
                xl: "100%",
                "2xl": "100%",
            },
        },
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', "sans-serif"],
                jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
            },
            fontSize: {
                '3xs': ['0.5rem', { lineHeight: '0.75rem' }],
                '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
                'xs2': ['0.6875rem', { lineHeight: '1rem' }],
            },
            borderRadius: {
                sm: "calc(var(--radius) - 4px)",
                md: "calc(var(--radius) - 2px)",
                lg: "var(--radius)",
                // xl/2xl/3xl plafonnés à var(--radius) + 4px (20px avec --radius: 1rem) : un seul
                // système cohérent au lieu des rayons Tailwind par défaut (12/16/24px) qui
                // désynchronisaient silencieusement dès que --radius changeait.
                xl: "calc(var(--radius) + 2px)",
                "2xl": "calc(var(--radius) + 4px)",
                "3xl": "calc(var(--radius) + 4px)",
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(59, 130, 246, 0.15)',
                'glow-md': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-lg': '0 0 40px rgba(59, 130, 246, 0.5)',
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.02)',
                'premium-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 1px 10px rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                'premium-gradient': 'linear-gradient(to br, var(--tw-gradient-stops))',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.6', transform: 'scale(1.1)' },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
