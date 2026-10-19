/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        meong: {
          bg: '#FFFBF7',
          cream: '#FFF6EC',
          peach: '#FFDCC9',
          peachSoft: '#FFF1E6',
          primary: '#D2694A',
          primaryDark: '#B85434',
          rose: '#E8A2B0',
          roseSoft: '#FBE3E8',
          lavender: '#C3AEDF',
          lavenderSoft: '#EFE8FA',
          mint: '#8ED4B2',
          mintSoft: '#E3F6EC',
          sun: '#F6C177',
          sunSoft: '#FDF0DC',
          ink: '#4A3B35',
          muted: '#8B7A72',
          line: '#F0E2D8',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(74 59 53 / 0.05), 0 8px 24px -12px rgb(74 59 53 / 0.16)',
        pop: '0 12px 36px -10px rgb(74 59 53 / 0.26)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
