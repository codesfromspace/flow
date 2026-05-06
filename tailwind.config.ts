import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        foreground: {
          light: '#171717',
          dark: '#f8fafc',
        },
        'card-bg': {
          light: '#f8f8f8',
          dark: '#1e293b',
        },
        'card-border': {
          light: '#e5e7eb',
          dark: '#334155',
        },
        'accent-cyan': '#22d3ee',
        'muted': {
          light: '#6b7280',
          dark: '#94a3b8',
        },
        'status-success': '#059669',
        'status-warning': '#b45309',
        'status-danger': '#dc2626',
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        headline: ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        title: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in',
        fadeInUp: 'fadeInUp 0.3s ease-out',
        pulseSoft: 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
