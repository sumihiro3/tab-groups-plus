/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/*.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light'],
  },
};
