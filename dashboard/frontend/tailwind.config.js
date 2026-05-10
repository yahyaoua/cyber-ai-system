export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        background: '#0f0c29',
        surface: '#24243e',
        panel: 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.12)',
        text: '#e2e8f0',
        muted: '#94a3b8',
        neonPink: '#FF6B9D',
        neonPurple: '#7F77DD',
        neonCyan: '#00D4FF',
        neonTeal: '#1D9E75',
        neonOrange: '#FF8C42',
        driftRed: '#E24B4A'
      },
      boxShadow: {
        glow: '0 0 30px rgba(0, 212, 255, 0.16)',
        card: '0 30px 80px rgba(15, 12, 41, 0.35)',
        soft: '0 15px 45px rgba(15, 12, 41, 0.22)'
      },
      backdropBlur: {
        xl: '18px'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
