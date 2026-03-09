import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand:   { DEFAULT: '#4a7fff', dark: '#3b6fef', light: '#93b4ff' },
        surface: { DEFAULT: '#2d2926', hi: '#333028' },
        card:    '#262220',
        void:    '#1c1917',
        deep:    '#211e1b',
      },
      animation: {
        'fade-up':      'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':        'float-y 4s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
        'ring-spin':    'ring-spin 3s linear infinite',
        'ring-slow':    'ring-spin 10s linear infinite',
        'ring-reverse': 'ring-spin-reverse 8s linear infinite',
        'gradient':     'gradient-shift 4s ease infinite',
        'shimmer':      'shimmer-slide 3s ease-in-out infinite',
        'pulse-fast':   'pulse 0.9s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-dot':    'pulse-dot 1.4s ease-in-out infinite',
        'spin-slow':    'spin 4s linear infinite',
        'slide-in':     'slide-in 0.3s ease forwards',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        'ring-spin':         { to: { transform: 'rotate(360deg)' } },
        'ring-spin-reverse': { to: { transform: 'rotate(-360deg)' } },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'shimmer-slide': {
          '0%':   { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(350%) skewX(-18deg)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':      { transform: 'scale(1.5)', opacity: '0.7' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-sm':    '0 0 16px rgba(74,127,255,0.28)',
        'glow':       '0 0 32px rgba(74,127,255,0.35)',
        'glow-lg':    '0 0 64px rgba(74,127,255,0.25)',
        'card':       '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
        'card-hover': '0 1px 3px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.3)',
        'btn':        '0 4px 16px rgba(74,127,255,0.25)',
        'btn-hover':  '0 8px 24px rgba(74,127,255,0.38)',
        'inner':      'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
