/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#DDB550',
                'bg': '#1E1A16',
                'secondary': '#27221C',
            },
            fontFamily: {
                main: ['"JejuMyeongjo"', "serif"],
                hind: ['"Hind"', "sans-serif"],
            },
        },
    },
    plugins: [],
}

