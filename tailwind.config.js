/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sun-dark': '#000000',      // Pure black
        'sun-panel': '#050505',     // Very dark
        'sun-border': '#ffffff0a',  // Extremely subtle white border (4% opacity)
        'sun-text': '#f8fafc',      // Slate-50
        'sun-green': '#10b981',     // Emerald-500
        'sun-green-hover': '#059669', // Emerald-600
        'brand-blue': '#3b82f6',    // Blue-500
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
