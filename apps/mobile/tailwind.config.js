/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'dime-navy':   '#0A0E1A',
        'dime-card':   '#111827',
        'dime-violet': '#7C3AED',
        'dime-violet-light': '#A78BFA',
        'dime-green':  '#10B981',
        'dime-red':    '#EF4444',
        'dime-amber':  '#F59E0B',
        'dime-text':   '#F9FAFB',
        'dime-muted':  '#6B7280',
        'dime-border': '#1F2937',
      },
      fontFamily: {
        'sans': ['Inter', 'system-font'],
      }
    }
  },
  plugins: [],
}
