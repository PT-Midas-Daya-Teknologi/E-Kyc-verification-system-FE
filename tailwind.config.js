/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        card: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },

      animation: {
        pulseRing: 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        pulseRing: {
          '0%, 100%': {
            opacity: '0.35',
            transform: 'scale(1)',
          },

          '50%': {
            opacity: '0.9',
            transform: 'scale(1.02)',
          },
        },
      },
    },
  },

  plugins: [],
};