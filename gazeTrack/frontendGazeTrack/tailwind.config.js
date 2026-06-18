/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'theme-background': '#0f172a', // Deep slate dark background
        'theme-surface': 'rgba(30, 41, 59, 0.7)', // Semi-transparent card surface
        'theme-primary': '#6366f1', // Indigo primary accent
        'theme-primary-hover': '#4f46e5',
        'theme-success': '#10b981', // Emerald success accent
        'theme-danger': '#ef4444', // Red warning accent
        'theme-text': '#f8fafc', // Light slate text
        'theme-text-muted': '#94a3b8', // Slate muted text
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-card-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
