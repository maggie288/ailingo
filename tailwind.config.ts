import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // AILingo / Duolingo-style palette
        primary: "#58CC02",      // brand green - success, main CTA
        "primary-dark": "#46A302",
        knowledge: "#CE82FF",    // purple - knowledge/concepts
        error: "#FF4B4B",       // wrong answer
        warning: "#FF9600",     // hearts low, alerts
        muted: "#AFAFAF",
        card: "#FFFFFF",
        border: "#E5E5E5",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
      boxShadow: {
        nav: "0 -1px 4px rgba(0,0,0,0.08)",
        card: "0 2px 8px rgba(0,0,0,0.06)",
      },
      maxWidth: {
        mobile: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
