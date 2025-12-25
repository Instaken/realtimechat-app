/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-dark': '#464655',
        'chat-grey': '#94958b',
        'chat-light': '#b7b6c1',
      },
    },
  },
  plugins: [],
}
