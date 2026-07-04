/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        sidebar: {
          DEFAULT: '#1A2740',
          hover: '#243654',
          active: '#2F6FED',
        }
      },
    },
  },
  plugins: [],
}
