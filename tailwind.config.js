/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: "#6366f1",
					50: "#eef2ff",
					100: "#e0e7ff",
					200: "#c7d2fe",
					300: "#a5b4fc",
					400: "#818cf8",
					500: "#6366f1",
					600: "#4f46e5",
					700: "#4338ca",
					800: "#3730a3",
					900: "#312e81",
				},
				amber: {
					DEFAULT: "#f59e0b",
					400: "#fbbf24",
					500: "#f59e0b",
					600: "#d97706",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
			},
			animation: {
				"fade-in": "fade-in 0.6s ease-out",
				"slide-up": "slide-up 0.6s ease-out",
				"float": "float 6s ease-in-out infinite",
				"float-delayed": "float 6s ease-in-out 3s infinite",
				"pulse-glow": "pulse-glow 4s ease-in-out infinite",
			},
			keyframes: {
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"slide-up": {
					from: { opacity: "0", transform: "translateY(20px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0) scale(1)" },
					"50%": { transform: "translateY(-20px) scale(1.05)" },
				},
				"pulse-glow": {
					"0%, 100%": { opacity: "0.4" },
					"50%": { opacity: "0.8" },
				},
			},
		},
	},
	plugins: [],
};
