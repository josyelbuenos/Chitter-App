import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto Mono', 'monospace'],
        headline: ['Orbitron', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          'from': { 'background-position': '200% 0' },
          'to': { 'background-position': '-200% 0' },
        },
        'aurora': {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
        'text-flicker-once': {
            '0%': { opacity: '0.1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '2%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '8%': { opacity: '0.1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '9%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '12%': { opacity: '0.1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '20%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '25%': { opacity: '0.3', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '30%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '70%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '72%': { opacity: '0.2', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '77%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
            '100%': { opacity: '1', textShadow: '0px 0px 29px hsl(var(--primary))' },
        },
        'cyber-pulse': {
          '0%, 100%': { borderColor: 'hsl(var(--primary) / 0.6)' },
          '50%': { borderColor: 'hsl(var(--accent) / 0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora': 'aurora 20s linear infinite',
        'text-flicker-once': 'text-flicker-once 2s linear 1s 1 forwards',
        'cyber-pulse': 'cyber-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
