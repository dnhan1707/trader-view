import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0b0e13',
          panel: '#11151b',
          border: '#1b222c',
          text: '#d6e2f0',
          muted: '#8b9bb4',
          accent: '#00e396',
          danger: '#ff4560',
          warning: '#feb019',
          info: '#008ffb',
          // Aliases for common terminal colors
          background: '#0b0e13',
          foreground: '#d6e2f0',
          success: '#00e396'
        }
      }
    }
  },
  plugins: []
} satisfies Config
