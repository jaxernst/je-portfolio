/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            rounded: {
                lg: "8px",
            },

            colors: {
                red: "#b12727",
                yellow: "#cab604",
                green: "#0cb918",
            },
        },
    },
    plugins: [],
};
