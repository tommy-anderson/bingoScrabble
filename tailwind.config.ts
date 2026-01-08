import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}", // Include gameUtils.ts for dynamic classes
  ],
  safelist: [
    // Difficulty colors - emerald (easy)
    "bg-emerald-900/70",
    "bg-emerald-800/80",
    "bg-emerald-700",
    "bg-emerald-900/40",
    "border-emerald-600",
    "border-emerald-400",
    "hover:border-emerald-400",
    "hover:bg-emerald-800/80",
    "ring-emerald-300",
    "shadow-emerald-900/50",
    "bg-emerald-400",
    // Difficulty colors - amber (medium)
    "bg-amber-900/70",
    "bg-amber-800/80",
    "bg-amber-700",
    "bg-amber-900/40",
    "border-amber-600",
    "border-amber-400",
    "hover:border-amber-400",
    "hover:bg-amber-800/80",
    "ring-amber-300",
    "shadow-amber-900/50",
    "bg-amber-400",
    // Difficulty colors - red (hard)
    "bg-red-900/70",
    "bg-red-800/80",
    "bg-red-700",
    "bg-red-900/40",
    "border-red-600",
    "border-red-400",
    "hover:border-red-400",
    "hover:bg-red-800/80",
    "ring-red-300",
    "shadow-red-900/50",
    "bg-red-400",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["Fredoka", "Comic Neue", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        condensed: ["Barlow Condensed", "Arial Narrow", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        "mark-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "checkmark-appear": {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
        "trophy-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "mark-bounce": "mark-bounce 300ms ease-out",
        "checkmark-appear": "checkmark-appear 400ms ease-out",
        "confetti-fall": "confetti-fall 1s ease-out forwards",
        "trophy-bounce": "trophy-bounce 500ms ease-out infinite",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
