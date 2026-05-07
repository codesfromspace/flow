import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f5f7f8',
          dark: '#f5f7f8',
        },
        foreground: {
          light: '#142123',
          dark: '#142123',
        },
        'card-bg': {
          light: '#ffffff',
          dark: '#ffffff',
        },
        'card-border': {
          light: '#dce5e4',
          dark: '#dce5e4',
        },
        'accent-cyan': '#0e9fa8',
        'accent-green': '#2f9b72',
        'accent-amber': '#c57a24',
        'accent-slate': '#607473',
        'muted': {
          light: '#647776',
          dark: '#647776',
        },
        'status-green': '#2f9b72',
        'status-blue': '#0e9fa8',
        'status-amber': '#c57a24',
        'status-red': '#c2413f',
        'status-success': '#2f9b72',
        'status-warning': '#c57a24',
        'status-danger': '#c2413f',
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
