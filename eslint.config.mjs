import globals from "globals";
import configLove from "eslint-config-love";
import pluginJs from "@eslint/js";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,ts}"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  configLove,
  // This enables the unicorn plugin so no need to enable it in plugins.
  pluginUnicorn.configs["flat/all"],
  {
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      tsdoc: pluginTsdoc,
    },
    rules: {
      "tsdoc/syntax": ["error"],
      "@typescript-eslint/class-methods-use-this": "off",
      "@typescript-eslint/consistent-type-exports": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-qualifier": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
      "unicorn/consistent-function-scoping": "off",
      // Using CommonJS not ESM.
      "unicorn/prefer-module": "off",
      // lgtv2 and node-ssdp modules uses EventEmitter.
      "unicorn/prefer-event-target": "off",
      // Not compatible with TypeScript.
      "unicorn/prefer-json-parse-buffer": "off",
      // Using CommonJS not ESM. Not supported by CommonJS.
      "unicorn/prefer-top-level-await": "off",
      //
      "unicorn/no-null": "off",
    },
  },
];
