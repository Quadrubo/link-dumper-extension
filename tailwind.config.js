const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.{html,js}",
        "./src/**/*.{html,js}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: colors.yellow,
            }
        },
    },
    plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
