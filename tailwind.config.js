/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00FFFF',
        'cyber-green': '#39FF14',
        'cyber-pink': '#FF1493',
        'cyber-purple': '#9400D3',
        'cyber-dark': '#0A0A0A',
        'cyber-gray': '#1A1A1A',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'mono': ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};