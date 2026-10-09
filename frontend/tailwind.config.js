/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0b2e19',
          800: '#14532D', // Primary Forest Green
          700: '#166534', // Secondary Green
          600: '#15803d',
        },
        emerald: {
          500: '#10B981', // Emerald Green
          600: '#059669',
        },
        mint: {
          100: '#D1FAE5', // Mint Green
          50: '#F0FDF4',  // Light Mint Background
        },
        brand: {
          text: '#17251D',
          muted: '#64748B',
          border: '#E2E8F0',
          amber: '#F59E0B',
          red: '#DC2626',
          blue: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(20, 83, 45, 0.08), 0 4px 6px -2px rgba(20, 83, 45, 0.04)',
      }
    },
  },
  plugins: [],
}
