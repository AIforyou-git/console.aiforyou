import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import eslintPluginTypeScript from "@typescript-eslint/eslint-plugin"; // ← 必要！
import tsParser from "@typescript-eslint/parser"; // ← パーサーも必要

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/out/**",
      "**/public/**"
    ]
  },
  {
    languageOptions: {
      parser: tsParser,
      
      parserOptions: {
  ecmaVersion: "latest",
  sourceType: "module"
}
    },
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
      "@typescript-eslint": eslintPluginTypeScript
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "no-unused-expressions": "off"
    }
  }
];
