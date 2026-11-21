/** @type {import('tailwindcss').Config} */

// Todos los colores de superficie/texto salen de variables CSS (src/index.css),
// así el tema claro/oscuro cambia solo con `data-theme` en <html>, sin overrides.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', '"Segoe UI Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      colors: {
        // Tokens semánticos
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        elevated: token('elevated'),
        line: token('line'),
        'line-strong': token('line-strong'),
        fg: token('fg'),
        muted: token('muted'),
        subtle: token('subtle'),
        accent: {
          DEFAULT: token('accent'),
          fg: token('accent-fg'),
          soft: token('accent-soft'),
        },
        // Paletas antiguas mapeadas a tokens (compatibilidad con páginas sin uso: Drivers/Browsers)
        primary: {
          300: token('accent-fg'), 400: token('accent-fg'), 500: token('accent'),
          600: token('accent'), 700: token('accent'),
        },
        dark: {
          50: token('fg'), 100: token('fg'), 200: token('fg'), 300: token('muted'),
          400: token('muted'), 500: token('subtle'), 600: token('line-strong'),
          700: token('line'), 800: token('surface'), 900: token('surface-2'), 950: token('bg'),
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.02)',
        lift: '0 10px 30px -12px rgb(0 0 0 / 0.25)',
        pop: '0 24px 60px -16px rgb(0 0 0 / 0.45)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.35), 0 8px 24px -8px rgb(var(--accent) / 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in': 'slideIn 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'scale-in': 'scaleIn 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'none' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'none' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'none' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [],
};
