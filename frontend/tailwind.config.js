/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep patriotic palette
        'flag-red': '#C41E3A',
        'flag-blue': '#1A365D',
        'flag-white': '#FAFAFA',
        // Navy scale for depth
        'navy': {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
          950: '#0C1929',
        },
        // Accent gold for highlights
        'gold': {
          400: '#F6C744',
          500: '#D4A528',
          600: '#B8860B',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(ellipse at top, rgba(26, 54, 93, 0.15) 0%, transparent 50%)',
        'stars-pattern': 'radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.2), transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.15), transparent), radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.2), transparent), radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.15), transparent), radial-gradient(1px 1px at 160px 20px, rgba(255,255,255,0.2), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-in': 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'blob': 'morphBlob 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '75%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(196, 30, 58, 0.3), 0 0 40px rgba(196, 30, 58, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(196, 30, 58, 0.5), 0 0 80px rgba(196, 30, 58, 0.2)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        morphBlob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
