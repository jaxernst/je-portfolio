/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      rounded: {
        lg: "8px",
      },

      colors: {
        red: "#b12727c9",
        "solid-red": "#b12727",
        yellow: "#cab604c9",
        "solid-yellow": "#cab604",
        green: "#0cb918c9",
        "solid-green": "#0cb918",
      },
    },
  },
  plugins: [],
};
