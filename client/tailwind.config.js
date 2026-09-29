/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#ffe58a',
          300: '#fbd34d',
          400: '#f3bd2e',
          500: '#dfa914',
          600: '#bc870b',
          700: '#94640a',
          800: '#79520f',
          900: '#654512',
        },

        secondary: {
          50: '#eff8f1',
          100: '#d8eedc',
          200: '#b6dfbf',
          300: '#87c994',
          400: '#59ad6c',
          500: '#368d4b',
          600: '#28743b',
          700: '#225c32',
          800: '#1e492b',
          900: '#193d25',
        },

        dark: {
          50: '#eef3f8',
          100: '#dbe5ef',
          200: '#b8c9dc',
          300: '#8aa7c3',
          400: '#5d83a7',
          500: '#3d6489',
          600: '#2e4f70',
          700: '#263f59',
          800: '#1d3249',
          900: '#14283d',
        },
      },

      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },

  plugins: [],
}