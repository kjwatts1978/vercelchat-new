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
        'neo-yellow': '#FFD700',
        'neo-pink': '#FF69B4',
        'neo-blue': '#00BFFF',
        'neo-green': '#32CD32',
        'neo-black': '#000000',
      },
      fontFamily: {
        neo: ['"Bebas Neue"', 'sans-serif', 'system-ui'],
        'neo-body': ['"Montserrat"', 'sans-serif', 'system-ui'],
      },
      boxShadow: {
        'neo-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-md': '6px 6px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [],
} 