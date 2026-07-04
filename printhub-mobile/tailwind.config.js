/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.tsx",
    "./src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F6FED',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2F6FED',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#1A2740',
          500: '#1A2740',
          600: '#0B1120',
        },
        accent: {
          DEFAULT: '#22D3EE',
          400: '#22D3EE',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        heading: ['Poppins', 'system-ui'],
      },
    },
  },
  plugins: [],
}
