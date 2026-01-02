import flowbite from "flowbite-react/plugin/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/dist/**/*.js",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        'chat-dark': '#464655',
        'chat-grey': '#94958b',
        'chat-light': '#b7b6c1',
      },
    },
  },
  plugins: [
    flowbite,
  ],
}
