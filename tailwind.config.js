/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',
          'orange-dark': '#E55A28',
          dark: '#1A1A2E',
          navy: '#16213E',
        },
      },
    },
  },
  plugins: [],
}
