/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#080B12',
        surface: '#0D1117',
        panel: '#111827',
        border: '#1F2937',
        muted: '#374151',
        accent: {
          DEFAULT: '#6EE7B7',
          dim: '#34D399',
          glow: 'rgba(110,231,183,0.15)',
        },
        amber: {
          glow: 'rgba(251,191,36,0.15)',
        },
        rose: {
          glow: 'rgba(251,113,133,0.15)',
        },
        sky: {
          glow: 'rgba(56,189,248,0.15)',
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(110,231,183,0.1)',
        'glow': '0 0 30px rgba(110,231,183,0.15)',
        'glow-lg': '0 0 60px rgba(110,231,183,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};