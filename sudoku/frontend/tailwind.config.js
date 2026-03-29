/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui'],
        sans: ['Inter', '"Manrope"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(5, 8, 20, 0.12)',
        glass: '0 1px 0 rgba(255,255,255,0.2) inset, 0 18px 45px rgba(9, 12, 26, 0.2)',
      },
    },
  },
  plugins: [],
}

