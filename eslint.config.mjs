// Nhóm 1: Built-in modules (Node.js core)
import { dirname } from "path";
import { fileURLToPath } from "url";

// Nhóm 2: External modules (npm packages)
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginTypescript from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Kế thừa cấu hình từ Next.js và Prettier
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  // Thêm cấu hình tùy chỉnh
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "@typescript-eslint": eslintPluginTypescript,
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // "prettier/prettier": ["warn", {}, { "usePrettierrc": true }],
      "react/no-unescaped-entities": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

export default eslintConfig;