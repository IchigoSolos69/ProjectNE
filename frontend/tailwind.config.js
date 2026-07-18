/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep': 'var(--color-navy-deep, #0F2854)',
        'royal-blue': 'var(--color-royal-blue, #1C4D8D)',
        'sky-blue': 'var(--color-sky-blue, #4988C4)',
        'ice-blue': 'var(--color-ice-blue, #BDE8F5)',
        'muted-gray': '#5C6B80', // derived from navy-deep desaturated
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      letterSpacing: {
        wide: '0.08em',
      },
    },
  },
  plugins: [],
}
