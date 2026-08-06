/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B1120',
          900: '#0F172A',
          850: '#152033',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          900: '#064E3B',
        },
        cyan: {
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        }
      },
    },
  },
  plugins: [],
}
