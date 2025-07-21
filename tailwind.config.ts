import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sora: ['Sora', 'sans-serif'],
				inter: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				notkode: {
					primary: 'hsl(var(--notkode-primary))',
					secondary: 'hsl(var(--notkode-secondary))',
					'light-gray': 'hsl(var(--notkode-light-gray))',
					'dark-gray': 'hsl(var(--notkode-dark-gray))',
					'deep-navy': 'hsl(var(--notkode-deep-navy))'
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { 
						transform: 'translateY(0px) translateX(0px) scale(1) rotate(0deg)',
						opacity: '0.7'
					},
					'25%': { 
						transform: 'translateY(-30px) translateX(20px) scale(1.1) rotate(2deg)',
						opacity: '0.9'
					},
					'50%': { 
						transform: 'translateY(-50px) translateX(-15px) scale(0.9) rotate(-1deg)',
						opacity: '0.6'
					},
					'75%': { 
						transform: 'translateY(-20px) translateX(-25px) scale(1.05) rotate(1deg)',
						opacity: '0.8'
					}
				},
				'magical-pulse': {
					'0%, 100%': { 
						opacity: '0.3',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.7',
						transform: 'scale(1.05)'
					}
				},
				'float-with-colors': {
					'0%, 100%': { 
						transform: 'translateY(0px) translateX(0px) scale(1) rotate(0deg)',
						filter: 'hue-rotate(0deg) brightness(1) saturate(1)'
					},
					'25%': { 
						transform: 'translateY(-30px) translateX(20px) scale(1.1) rotate(2deg)',
						filter: 'hue-rotate(90deg) brightness(1.2) saturate(1.1)'
					},
					'50%': { 
						transform: 'translateY(-50px) translateX(-15px) scale(0.9) rotate(-1deg)',
						filter: 'hue-rotate(180deg) brightness(0.8) saturate(0.9)'
					},
					'75%': { 
						transform: 'translateY(-20px) translateX(-25px) scale(1.05) rotate(1deg)',
						filter: 'hue-rotate(270deg) brightness(1.1) saturate(1.05)'
					}
				},
				'float-across-screen': {
					'0%': { 
						transform: 'translateX(-20vw) translateY(0px) scale(1) rotate(0deg)',
						filter: 'hue-rotate(0deg) brightness(1) saturate(1)'
					},
					'20%': { 
						transform: 'translateX(20vw) translateY(-15vh) scale(1.1) rotate(5deg)',
						filter: 'hue-rotate(72deg) brightness(1.2) saturate(1.1)'
					},
					'40%': { 
						transform: 'translateX(60vw) translateY(-10vh) scale(0.9) rotate(-3deg)',
						filter: 'hue-rotate(144deg) brightness(0.8) saturate(0.9)'
					},
					'60%': { 
						transform: 'translateX(80vw) translateY(10vh) scale(1.05) rotate(2deg)',
						filter: 'hue-rotate(216deg) brightness(1.1) saturate(1.05)'
					},
					'80%': { 
						transform: 'translateX(40vw) translateY(20vh) scale(0.95) rotate(-1deg)',
						filter: 'hue-rotate(288deg) brightness(0.9) saturate(0.95)'
					},
					'100%': { 
						transform: 'translateX(-20vw) translateY(0px) scale(1) rotate(0deg)',
						filter: 'hue-rotate(360deg) brightness(1) saturate(1)'
					}
				},
				'gentle-float-fade': {
					'0%': { 
						opacity: '0',
						transform: 'scale(0.3) translateX(0px) translateY(0px) rotate(0deg)',
						filter: 'hue-rotate(0deg) brightness(1)'
					},
					'10%': { 
						opacity: '0.3',
						transform: 'scale(0.8) translateX(10vw) translateY(-5vh) rotate(15deg)',
						filter: 'hue-rotate(36deg) brightness(0.8)'
					},
					'25%': { 
						opacity: '0.25',
						transform: 'scale(1.1) translateX(25vw) translateY(-15vh) rotate(-10deg)',
						filter: 'hue-rotate(90deg) brightness(0.4)'
					},
					'40%': { 
						opacity: '0.35',
						transform: 'scale(0.9) translateX(50vw) translateY(-8vh) rotate(20deg)',
						filter: 'hue-rotate(144deg) brightness(0.6)'
					},
					'55%': { 
						opacity: '0.2',
						transform: 'scale(1.2) translateX(75vw) translateY(10vh) rotate(-5deg)',
						filter: 'hue-rotate(198deg) brightness(0.3)'
					},
					'70%': { 
						opacity: '0.3',
						transform: 'scale(0.8) translateX(90vw) translateY(20vh) rotate(25deg)',
						filter: 'hue-rotate(252deg) brightness(0.7)'
					},
					'85%': { 
						opacity: '0.15',
						transform: 'scale(1.0) translateX(60vw) translateY(25vh) rotate(-15deg)',
						filter: 'hue-rotate(306deg) brightness(0.5)'
					},
					'100%': { 
						opacity: '0',
						transform: 'scale(0.3) translateX(0px) translateY(0px) rotate(0deg)',
						filter: 'hue-rotate(360deg) brightness(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'magical-pulse': 'magical-pulse 4s ease-in-out infinite',
				'float-with-colors': 'float-with-colors 8s ease-in-out infinite',
				'float-across-screen': 'float-across-screen 15s ease-in-out infinite',
				'gentle-float-fade': 'gentle-float-fade 15s cubic-bezier(0.4, 0, 0.2, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
