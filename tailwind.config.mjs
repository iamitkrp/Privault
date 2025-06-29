export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neubrutalism Color Palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        destructive: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Legacy support
        bg: {
          primary: '#0E0F13',
          glass: 'rgba(255,255,255,0.05)',
        },
        text: {
          high: '#FFFFFF',
          muted: 'rgba(255,255,255,0.6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', 'sans-serif'],
        display: ['Sora', 'var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-hover': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-pressed': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-white': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-white-hover': '6px 6px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-white-pressed': '2px 2px 0px 0px rgba(255, 255, 255, 1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-brutal': 'pulse-brutal 2s ease-in-out infinite',
        'bounce-brutal': 'bounce-brutal 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-2deg)' },
        },
        'pulse-brutal': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'bounce-brutal': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-glow': {
          'text-shadow': '0 0 20px currentColor',
        },
        '.text-outline': {
          '-webkit-text-stroke': '2px currentColor',
          'color': 'transparent',
        },
        '.text-3d': {
          'text-shadow': '2px 2px 0px currentColor, 4px 4px 0px rgba(0, 0, 0, 0.3)',
        },
        '.border-brutal': {
          'border': '2px solid black',
        },
        '.shadow-brutal': {
          'box-shadow': 'var(--shadow)',
        },
        '.shadow-brutal-hover:hover': {
          'box-shadow': 'var(--shadow-hover)',
          'transform': 'translate(-2px, -2px)',
        },
        '.bg-pattern': {
          'background-image': 'radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 2px, transparent 2px)',
          'background-size': '40px 40px',
        },
        '.grid-pattern': {
          'background-image': 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}; 
