/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          bg: {
            primary: '#0c0f23',      // main background
            secondary: '#111d3e',    // cards / panels
            tertiary: '#1e293b',     // hover / overlay
            overlay: '#0c0f23cc',    // semi-transparent
          },
          text: {
            primary: '#e5eef8',      // main text
            secondary: '#c5d5e3',    // secondary text
            tertiary: '#94a3b8',     // muted / disabled
          },
          border: '#334155',         // border color
          accent: '#facc15',         // amber accents
          danger: '#f87171',         // red for delete/log out
        },
      },
      boxShadow: {
        'card-dark': '0 18px 54px rgba(0,0,0,0.36)',
      },
      borderRadius: {
        'xl-custom': '28px',
        '2xl-custom': '38px',
      },
    },
  },
  plugins: [],
}