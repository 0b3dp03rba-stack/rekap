import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a12",
        panel: "#14141f",
        panel2: "#1b1b29",
        border: "#26263a",
        aura: "#9b6bff",
        cyan: "#3ee6d0",
        success: "#5ce07a",
        danger: "#ff6b6b",
        muted: "#8a8aa3",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
