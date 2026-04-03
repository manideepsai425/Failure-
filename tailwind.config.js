
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'DM Mono'", 'monospace'],
        body:    ["'IBM Plex Sans'", 'sans-serif'],
      },
      colors: {
        surface: {
          900: '#0a0f1a',
          800: '#111827',
          700: '#1a2233',
          600: '#1f2d42',
        },
      },
    },
  },
  plugins: [],
}