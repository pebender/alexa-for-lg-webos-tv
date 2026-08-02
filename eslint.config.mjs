import globals from "globals";
import pluginJs from "@eslint/js";
import pluginTsdoc from "eslint-plugin-tsdoc";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,ts}"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      tsdoc: pluginTsdoc,
    },
    rules: {
      "tsdoc/syntax": ["error"],
      "@typescript-eslint/class-methods-use-this": ["error", { "ignoreClassesThatImplementAnInterface": true }],
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-unused-private-class-members": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
      "complexity": "off",
      "no-useless-assignment": "off",
      "promise/avoid-new": "off",
    },
  },
];
