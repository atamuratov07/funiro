/** @type {import('tailwindcss').Config} */
import * as defaultTheme from 'tailwindcss/defaultTheme'

export default {
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
		},
		extend: {
			fontFamily: {
				sans: ['var(--font-primary)', defaultTheme.fontFamily.sans],
			},
			colors: {
				primary: 'var(--color-primary)',
				secondary: {
					DEFAULT: 'var(--color-secondary)',
					dark: 'var(--color-secondary-dark)',
				},
				accent: 'var(--color-accent)',
				bg: {
					DEFAULT: 'var(--color-bg-primary)',
					light: 'var(--color-bg-secondary)',
				},
				'dark-blue': 'var(--color-icon)',
			},
		},
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [require('tailwindcss-animate')],
}
