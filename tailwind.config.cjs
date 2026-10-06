/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2B2350',
        sky: '#7FD3F7',
        grass: '#8BD46E',
        sun: '#FFC93C',
        berry: '#FF5D8F',
        lilac: '#A98BFF',
        mint: '#5FE0B7',
      },
      fontFamily: {
        display: ['Grandstander', 'ui-rounded', 'Comic Sans MS', 'system-ui', 'sans-serif'],
        body: ['Lexend', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        chunky: '0 5px 0 #2B2350',
        chunkysm: '0 3px 0 #2B2350',
      },
    },
  },
  plugins: [],
};
