/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* Brand Teal */
        teal: {
          950: '#052e27',
          900: '#0a4a3f',
          700: '#0f6b5c',
          600: '#12856e',
          500: '#1a9b84',
          400: '#27c4a4',
          300: '#3ed9be',
          100: '#c1f5ec',
          50:  '#e8faf7',
        },
        /* Accent Amber */
        amber: {
          600: '#FC6C26',
          500: '#FC6C26',
          400: '#FC6C26',
          300: '#FC6C26',
          100: '#fdecd3',
        },
        /* Accent Orange */
        orange: {
          900: '#FC6C26',
          800: '#FC6C26',
          700: '#FC6C26',
          600: '#FC6C26',
          500: '#FC6C26',
          400: '#FC6C26',
          300: '#FC6C26',
          200: '#FC6C26',
          100: '#FC6C26',
          50:  '#fdecd3',
        },
        /* AI Violet */
        violet: {
          700: '#4a3d56',
          600: '#6c5b7b',
          400: '#9b86b0',
          100: '#e9e3f0',
        },
        /* Neutral Warm */
        warm: {
          950: '#101418',
          900: '#161b22',
          800: '#1f2733',
          700: '#263040',
          600: '#4a4036',
          500: '#8c7c6a',
          400: '#c8bfb0',
          300: '#e8e0d4',
          200: '#f3ede4',
          100: '#faf7f2',
        },
        /* Semantic */
        success: '#3fa796',
        warning: '#e8a33d',
        danger: '#d65d5d',
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          overlay: 'var(--bg-overlay)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm':  'clamp(0.875rem, 1.5vw, 1rem)',
        'fluid-base':'clamp(1rem, 2vw, 1.125rem)',
        'fluid-lg':  'clamp(1.125rem, 2.5vw, 1.375rem)',
        'fluid-xl':  'clamp(1.25rem, 3vw, 1.875rem)',
        'fluid-2xl': 'clamp(1.5rem, 3.5vw, 2.75rem)',
        'fluid-3xl': 'clamp(2rem, 5vw, 4rem)',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '-0.01em',
        wide: '0.015em',
        wider: '0.03em',
        widest: '0.08em',
      },
      spacing: {
        sidebar: '260px',
        topbar: '64px',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        card:       '0 4px 20px rgba(15, 107, 92, 0.12)',
        'card-hover':'0 12px 40px rgba(15, 107, 92, 0.25), 0 0 0 1px rgba(15, 107, 92, 0.05)',
        teal:       '0 8px 30px rgba(15, 107, 92, 0.35)',
        amber:      '0 8px 30px rgba(252, 108, 38, 0.4)',
        orange:     '0 8px 30px rgba(252, 108, 38, 0.4)',
        glow:       '0 0 32px rgba(62, 217, 190, 0.3)',
        ultra:      '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)', /* World Top 5 deep shadow */
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #052e27 0%, #0a4a3f 40%, #4a3d56 100%)',
        'card-gradient': 'linear-gradient(135deg, #0f6b5c 0%, #1a9b84 100%)',
        'amber-gradient':'linear-gradient(135deg, #FC6C26 0%, #FC6C26 100%)',
        'orange-gradient':'linear-gradient(135deg, #FC6C26 0%, #FC6C26 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease forwards',
        'heart': 'heart-fill 0.4s ease-in-out',
        'gradient-shift': 'gradient-shift 4s ease infinite',
      },
      backdropBlur: {
        xs: '4px',
        ultra: '40px', /* Extreme glassmorphism blur */
      },
      transitionDuration: {
        theme: '300ms',
      },
    },
  },
  plugins: [],
}
