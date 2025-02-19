import type { Config } from "tailwindcss";


const config: Config = {
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateY(-80%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out'
      }
  }
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ], 
  plugins: [],
};

export default config;
