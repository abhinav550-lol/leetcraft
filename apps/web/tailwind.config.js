/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      colors: {
        surface: {
          0: '#000000',
          1: '#0a0a0a',
          2: '#111111',
          3: '#161616',
          4: '#1a1a1a',
          5: '#222222',
          6: '#2a2a2a'
        },
        border: {
          DEFAULT: '#ffffff0d',
          subtle: '#ffffff08',
          medium: '#ffffff14',
          strong: '#ffffff22'
        },
        accent: {
          DEFAULT: '#ffffff',
          muted: '#a0a0a0',
          dim: '#666666'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    }
  },
  plugins: []
}
