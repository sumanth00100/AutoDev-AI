import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#4353ff',
          dark:    '#3444dd',
          light:   '#7b88ff',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-up':    'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow':  'spin 3s linear infinite',
        'pulse-fast': 'pulse 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob-a':     'blob-drift-a 18s ease-in-out infinite alternate',
        'blob-b':     'blob-drift-b 22s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.9' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blob-drift-a': {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(5%, 8%) scale(1.1)' },
        },
        'blob-drift-b': {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(-6%, -5%) scale(1.08)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(67,83,255,0.3)',
        'glow':    '0 0 28px rgba(67,83,255,0.35)',
        'glow-lg': '0 0 56px rgba(67,83,255,0.25)',
        'blue':    '0 4px 24px rgba(67,83,255,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
