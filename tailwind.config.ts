import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans:      ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
        dm:        ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
        bricolage: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        label:     ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
        mono:      ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Brand
        primary: {
          DEFAULT: '#3B82F6',
          soft: '#93C5FD',
          foreground: '#0F172A',
        },
        navy: '#131520',
        // Extended blue ramp
        cyan: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Extended neutral ramp
        neutral: {
          0:   '#FFFFFF',
          50:  '#F7F7F8',
          100: '#E6E6E6',
          200: '#CECFD2',
          300: '#A4A6AC',
          400: '#7B7E85',
          500: '#5C5F66',
          600: '#41434A',
          700: '#2A2C34',
          800: '#1B1D27',
          900: '#131520',
          950: '#0A0B11',
        },
        // Semantic surfaces (consume CSS vars for theme support)
        surface: {
          base: 'hsl(var(--surface-base))',
          elevated: 'hsl(var(--surface-elevated))',
          glass: 'rgb(var(--surface-glass))',
        },
        border: {
          subtle: 'rgb(var(--border-subtle))',
          strong: 'rgb(var(--border-strong))',
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted: 'hsl(var(--text-muted))',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      spacing: {
        section: '5rem',
        'section-lg': '8rem',
      },
      boxShadow: {
        glow: '0 0 32px rgba(59, 130, 246, 0.35)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.32)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at center, rgba(59,130,246,.18) 0%, transparent 65%)',
      },
      backdropBlur: { glass: '20px' },
      keyframes: {
        'float-soft':     { '0%,100%': { transform: 'translateY(0) rotate(0)' }, '50%': { transform: 'translateY(-18px) rotate(4deg)' } },
        'float-soft-alt': { '0%,100%': { transform: 'translateY(0) rotate(0)' }, '50%': { transform: 'translateY(-14px) rotate(-5deg)' } },
        'gentle-pulse':   { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.02)' } },
        'fade-up':        { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'glow-pulse':     { '0%,100%': { boxShadow: '0 0 16px rgba(59,130,246,.3)' }, '50%': { boxShadow: '0 0 32px rgba(59,130,246,.6)' } },
        marquee:          { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'float-soft': 'float-soft 7s ease-in-out infinite',
        'float-soft-alt': 'float-soft-alt 9s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(.16,1,.3,1)',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'marquee': 'marquee 50s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
