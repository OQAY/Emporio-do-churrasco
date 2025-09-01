/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CORES EXATAS DO PROJETO ORIGINAL - NÃO MUDAR!
        'brand-orange': '#fb923c',
        'brand-orange-dark': '#f97316',
      },
    },
  },
  plugins: [],
}