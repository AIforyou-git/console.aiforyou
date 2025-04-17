// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",     // App Router 対応
    "./components/**/*.{js,ts,jsx,tsx}", // 共通コンポーネント対応
    "./lib/**/*.{js,ts,jsx,tsx}",     // Firebase 等ライブラリコード対応（任意）
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        danger: "#e74c3c",
        success: "#28a745",
        brand: "#1abc9c",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontSize: {
        xxs: "0.65rem",
      },
    },
  },
  plugins: [],
};

export default config;
