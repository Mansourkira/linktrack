import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Image optimization warnings
      "@next/next/no-img-element": "warn",

      // Unused variables - more lenient
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],

      // Allow any type in development
      "@typescript-eslint/no-explicit-any": "warn",

      // React hooks exhaustive deps - more lenient
      "react-hooks/exhaustive-deps": "warn",

      // Unescaped entities - allow in development
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
