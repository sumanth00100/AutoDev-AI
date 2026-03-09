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
        brand:  { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#a5b4fc' },
        violet: { DEFAULT: '#8b5cf6', light: '#c4b5fd' },
        cyan:   { DEFAULT: '#22d3ee', light: '#67e8f9' },
        void:   '#03030f',
        deep:   '#06061a',
      },
      animation: {
        'fade-up':        'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':          'float-y 5s ease-in-out infinite',
        'glow-breathe':   'glow-breathe 3s ease-in-out infinite',
        'ring-spin':      'ring-spin 3s linear infinite',
        'ring-slow':      'ring-spin 10s linear infinite',
        'ring-reverse':   'ring-spin-reverse 8s linear infinite',
        'gradient':       'gradient-shift 4s ease infinite',
        'shimmer':        'shimmer-slide 2.8s ease-in-out infinite',
        'pulse-fast':     'pulse 0.9s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-dot':      'pulse-dot 1.4s ease-in-out infinite',
        'spin-slow':      'spin 4s linear infinite',
        'slide-in':       'slide-in 0.3s ease forwards',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-12px) rotate(0.5deg)' },
          '66%':      { transform: 'translateY(-5px) rotate(-0.5deg)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.45' },
          '50%':      { opacity: '1' },
        },
        'ring-spin':         { 'to': { transform: 'rotate(360deg)' } },
        'ring-spin-reverse': { 'to': { transform: 'rotate(-360deg)' } },
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
          'from': { opacity: '0', transform: 'translateX(10px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-sm':   '0 0 16px rgba(99,102,241,0.3)',
        'glow':      '0 0 32px rgba(99,102,241,0.38)',
        'glow-lg':   '0 0 64px rgba(99,102,241,0.28)',
        'glow-vi':   '0 0 24px rgba(139,92,246,0.35)',
        'card':      '0 20px 50px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.3)',
        'card-hover':'0 24px 60px rgba(0,0,0,0.55), 0 0 50px rgba(99,102,241,0.07)',
        'btn':       '0 4px 20px rgba(99,102,241,0.4)',
        'btn-hover': '0 8px 32px rgba(99,102,241,0.55)',
        'inner':     'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
