import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "Liberation Sans", "sans-serif"],
        mono: ["Consolas", "Lucida Console", "Menlo", "DejaVu Sans Mono", "Courier New", "monospace"],
      },
      colors: {
        // ESGX terminal palette (flat, IBKR-style)
        bg: "#000000",
        panel: "#0d0e10",
        panel2: "#121316",
        panel3: "#17191d",
        titlebar: "#1b1d22",
        rowalt: "#0f1013",
        hoverrow: "#232631",
        selrow: "#14385f",
        line: "#2a2c31",
        line2: "#3a3d44",
        txt: "#d2d4d8",
        txt2: "#969aa3",
        txt3: "#6a6e77",
        up: "#2bbb46",
        down: "#e23b3b",
        blue: "#2f6fc9",
        // verdict colours (dual-encoded on the Map with fill/outline)
        vHiddenImprover: "#1fbf4f",
        vProvenImprover: "#1fbf4f",
        vHiddenRisk: "#d83333",
        vClearRisk: "#f0791e",
        vNoSignal: "#7d828c",
      },
    },
  },
  plugins: [],
};
export default config;
