/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom color tokens
                'bg': '#0f1117',   // page background
                'surface': '#161b27',   // card/nav background
                'card': '#1c2333',   // inner card
                'border': '#2d3441',   // border color
                'accent': '#3b82f6',   // blue accent
            },
        },
    },
    plugins: [],
}