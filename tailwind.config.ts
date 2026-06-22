import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
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
        // Mosaic palette — fixed Arkode coral, no per-tenant theming.
        canvas: "#FAF8F3",
        bone: { DEFAULT: "#F4ECDE", 2: "#EFE6D6" },
        ink: { DEFAULT: "#001C43", soft: "#33405E" },
        mute: "#6B7390",
        faint: "#9AA1B6",
        line: { DEFAULT: "#E4DECF", 2: "#D7CFBC" },
        coral: { DEFAULT: "#FF6C5D", deep: "#E8503F" },
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
