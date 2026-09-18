import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        north: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0284c7',
          dark: '#034694',
        },
        earth: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#ea580c',
          dark: '#c2410c',
        },
        wood: {
          light: '#d4a373',
          dark: '#8b5a2b',
          border: '#5c3a21',
        },
      },
      fontFamily: {
        game: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bungee)', 'sans-serif'],
      },
      boxShadow: {
        'game-blue': '0 8px 0 #075985, 0 15px 25px rgba(2, 132, 199, 0.35)',
        'game-orange': '0 8px 0 #9a3412, 0 15px 25px rgba(234, 88, 12, 0.35)',
        'game-green': '0 8px 0 #15803d, 0 15px 25px rgba(34, 197, 94, 0.35)',
        'game-wood': '0 6px 0 #5c3a21, 0 10px 20px rgba(0,0,0,0.3)',
        'card-glow': '0 0 25px rgba(14, 165, 233, 0.25)',
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite ease-in-out',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
