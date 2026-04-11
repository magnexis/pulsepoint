import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        pulse: {
          50: "#f3fbff",
          100: "#e6f7ff",
          200: "#c0ebff",
          300: "#79d5ff",
          400: "#1ab4ff",
          500: "#0091e6",
          600: "#006cae",
          700: "#004d7d",
          800: "#0d3958",
          900: "#112d44"
        },
        mint: {
          300: "#7ff2d2",
          500: "#24c79b"
        },
        coral: {
          400: "#ff7f73",
          500: "#f25b4b"
        }
      },
      backgroundImage: {
        "pulse-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)"
      },
      boxShadow: {
        glass: "0 20px 80px rgba(9, 18, 34, 0.24)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "\"Satoshi\"",
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "sans-serif"
        ],
        display: [
          "\"Clash Display\"",
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "sans-serif"
        ]
      },
      keyframes: {
        "pulse-rise": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "pulse-rise": "pulse-rise 0.65s ease-out forwards"
      }
    },
  },
  plugins: [],
};

export default config;

