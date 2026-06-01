/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F5C33C',
          'orange-dark': '#E8A820',
          dark: '#1C1C1E',
          navy: '#16213E',
          cream: '#F4F3EE',
        },
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        'card-md': '0 4px 24px rgba(0,0,0,0.09)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
