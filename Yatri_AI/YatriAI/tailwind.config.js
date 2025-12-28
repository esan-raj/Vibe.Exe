/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kolkata Heritage Color Palette
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFB800', // Tram Yellow
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          50: '#fef7f0',
          100: '#fce8d5',
          200: '#f9cca8',
          300: '#f5a970',
          400: '#f07d37',
          500: '#C45C26', // Terracotta
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#6c2710',
        },
        // Kolkata Specific Colors
        kolkata: {
          yellow: '#FFB800',     // Iconic Tram Yellow
          gold: '#D4A015',       // Heritage Gold
          terracotta: '#C45C26', // Kumartuli Terracotta
          sindoor: '#E23D28',    // Sindoor Red
          vermillion: '#FF4136', // Durga Vermillion
          maroon: '#7B2D26',     // Baluchari Maroon
          purple: '#4A235A',     // Silk Purple
          blue: '#1E3A5F',       // Jamdani Blue
          hooghly: '#1A5276',    // Hooghly River Blue
          maidan: '#2D5A27',     // Maidan Green
          sepia: '#8B7355',      // Heritage Sepia
          cream: '#FFFEF7',      // Marble Cream
          white: '#F5F5F0',      // Victoria Memorial White
        },
        heritage: {
          50: '#fefcf3',
          100: '#fdf7e1',
          200: '#fbf0c3',
          300: '#f7e29a',
          400: '#f2ce6f',
          500: '#ecba47',
          600: '#dea02c',
          700: '#b87a24',
          800: '#946024',
          900: '#794f21',
        },
        durga: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffcbcb',
          300: '#ffa5a5',
          400: '#ff6b6b',
          500: '#E23D28', // Sindoor Red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Poppins', 'system-ui', 'serif'],
        bengali: ['Hind Siliguri', 'Tiro Bangla', 'sans-serif'],
        heritage: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        // Magic UI animations
        'gradient': 'gradient 6s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'marquee': 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        'meteor': 'meteor 5s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Kolkata-specific animations
        'tram': 'tramMove 20s linear infinite',
        'dhunuchi': 'dhunuchi 0.8s ease-in-out infinite',
        'alpona': 'alponaFade 3s ease-in-out infinite',
        'river-flow': 'riverFlow 15s linear infinite',
        'flame': 'flame 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Magic UI keyframes
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px rgba(255, 184, 0, 0.5), 0 0 20px rgba(255, 184, 0, 0.3)' 
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(255, 184, 0, 0.8), 0 0 40px rgba(255, 184, 0, 0.5)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { 
            textShadow: '0 0 10px rgba(255, 184, 0, 0.5), 0 0 20px rgba(255, 184, 0, 0.3)' 
          },
          '100%': { 
            textShadow: '0 0 20px rgba(196, 92, 38, 0.8), 0 0 30px rgba(196, 92, 38, 0.5)' 
          },
        },
        // Kolkata-specific keyframes
        tramMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        dhunuchi: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        alponaFade: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        riverFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        flame: {
          '0%': { transform: 'scale(1) rotate(-2deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1.1) rotate(2deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        // Kolkata patterns - keeping subtle gradients for depth
        'kolkata-subtle': 'linear-gradient(135deg, #FFB800 0%, #D4A015 100%)',
        'heritage-subtle': 'linear-gradient(135deg, #D4A015 0%, #C45C26 100%)',
        'tram-subtle': 'linear-gradient(90deg, #FFB800 0%, #D4A015 100%)',
        'durga-subtle': 'linear-gradient(135deg, #E23D28 0%, #FF4136 100%)',
        'hooghly-subtle': 'linear-gradient(180deg, #1A5276 0%, #2D5A27 100%)',
      },
      boxShadow: {
        'tram': '0 8px 32px rgba(255, 184, 0, 0.25)',
        'terracotta': '0 8px 32px rgba(196, 92, 38, 0.25)',
        'heritage': '0 8px 32px rgba(139, 115, 85, 0.25)',
        'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'elegant-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
