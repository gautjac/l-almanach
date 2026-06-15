/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // L'Almanach speaks through CSS variables so the whole palette can drift
        // with the season (spring greens → summer → autumn ochre → winter blue).
        // The variables are set in index.css and re-tinted by the season layer.
        bg: "rgb(var(--alm-bg) / <alpha-value>)",
        surface: "rgb(var(--alm-surface) / <alpha-value>)",
        line: "rgb(var(--alm-line) / <alpha-value>)",
        ink: "rgb(var(--alm-ink) / <alpha-value>)",
        muted: "rgb(var(--alm-muted) / <alpha-value>)",
        accent: "rgb(var(--alm-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--alm-accent-soft) / <alpha-value>)",
        gild: "rgb(var(--alm-gild) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.6s cubic-bezier(0.22,0.61,0.36,1) both",
        fadeIn: "fadeIn 0.9s ease-out both",
        breathe: "breathe 2.4s ease-in-out infinite",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
