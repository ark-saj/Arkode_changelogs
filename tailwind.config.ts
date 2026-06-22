import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      transitionTimingFunction: {
        ark: "cubic-bezier(0.22,0.68,0,1)",
      },
      colors: {
        // Mosaic palette — RGB channel tokens (see globals.css) so opacity
        // modifiers work and the .dark block can flip every utility class.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        bone: {
          DEFAULT: "rgb(var(--bone) / <alpha-value>)",
          2: "rgb(var(--bone-2) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          surface: "rgb(var(--ink-surface) / <alpha-value>)",
        },
        mute: "rgb(var(--mute) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          2: "rgb(var(--line-2) / <alpha-value>)",
        },
        coral: {
          DEFAULT: "rgb(var(--coral) / <alpha-value>)",
          deep: "rgb(var(--coral-deep) / <alpha-value>)",
        },
        // Mosaic accents — illustration only (canvas, pixel icons, badge tints).
        orange: "#FF8A3D",
        crimson: "#C5362A",
        blue: "#2A6FDB",
        green: "#1F8A5B",
        // Changelog status colors (muted mono badge tints come from changelog-meta).
        status: {
          new: "#E8503F",
          improvement: "#2A6FDB",
          fix: "#C5362A",
          optimization: "#FF8A3D",
        },
      },
      borderRadius: {
        sm6: "6px",
        md9: "9px",
        lg14: "14px",
        // existing scale kept harmlessly
        "4xl": "2rem",
        "3xl": "1.5rem",
        "2xl": "1.25rem",
        xl: "1rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Aliased to Geist so any leftover references stay on-brand.
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        description: ["var(--font-sans)", "system-ui", "sans-serif"],
        editorial: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        e1: "0 1px 2px rgba(0,28,67,0.06)",
        e2: "0 6px 16px -8px rgba(0,28,67,0.16)",
        e3: "0 24px 50px -22px rgba(0,28,67,0.28)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 0.68, 0, 1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
