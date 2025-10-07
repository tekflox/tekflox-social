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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ai: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        candy: {
          pink: '#ff6b9d',
          purple: '#c084fc',
          blue: '#60a5fa',
          cyan: '#22d3ee',
          green: '#4ade80',
          yellow: '#fbbf24',
          orange: '#fb923c',
        },
        social: {
          instagram: '#E4405F',
          facebook: '#1877F2',
          whatsapp: '#25D366',
          youtube: '#FF0000',
          tiktok: '#000000',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-candy': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ai': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      },
      boxShadow: {
        'candy': '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'ai': '0 8px 32px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
