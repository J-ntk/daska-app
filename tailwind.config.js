/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E1A",
        surface: "#131928",
        surfaceHover: "#1A2236",
        line: "#232B40",
        ink: "#E8EBF3",
        inkMuted: "#8992A8",
        accent: "#2F6FF0",
        accentLight: "#5FA0FF",
        silver: "#C7CEDC",
        paper: "#0A0E1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(47,111,240,0.4), 0 0 24px -4px rgba(47,111,240,0.35)",
      },
    },
  },
  plugins: [],
};