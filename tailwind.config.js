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
        deathBG: "url('./assets/deathCross.png')",
        throneBG: "url('./assets/thronebg.jpg')",
        bbabBG: "url('./assets/bbab.gif')",
        momoBG: "url('./assets/momobg.jpg')",
        suBG: "url('./assets/subg.jpg')",
        moaBG: "url('./assets/moabg.jpg')",
        yuiBG: "url('./assets/yuibg.jpg')",
        bbmBG: "url('./assets/bbm.jpg')",
        megitsuneBG: "url('./assets/megitsune.jpg')",
      },
    },
  },
  plugins: [],
};
