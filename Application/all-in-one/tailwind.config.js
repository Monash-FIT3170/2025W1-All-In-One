/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './imports/ui/**/*.{js,jsx,ts,tsx}', // <- adjust path to where your components live
    './client/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ['"Geist"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
