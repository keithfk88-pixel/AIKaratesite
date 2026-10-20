/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', '"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        washi: {
          DEFAULT: '#FAF8F5',
          warm: '#F3EFE9',
          border: '#E5DFD5',
        },
        sumi: {
          DEFAULT: '#181615',
          muted: '#57534E',
          light: '#78716C',
        },
        crimson: {
          DEFAULT: '#A61C1C',
          dark: '#861515',
          soft: '#FDF2F2',
        },
        kiniro: {
          DEFAULT: '#B47B2A',
          light: '#F8F1E3',
        }
      }
    },
  },
  plugins: [],
};
