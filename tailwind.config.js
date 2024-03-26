/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bmRed: '#E50012',
      },
      backgroundImage: {
        logoBM: "url('./assets/logo.png')",
        logoRed: "url('./assets/logored.svg')",
        smoke: "url('./assets/smoke.jpg')",
        theOne: "url('./assets/theone.jpg')",
        backBM: "url('./assets/background.jpg')",
        dokiBG: "url('./assets/dokibg.png')",
        otfgkBG: "url('./assets/otfgkbg.jpg')",
      },
    },
  },
  plugins: [],
};
