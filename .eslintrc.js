module.exports = {
  globals: {
    "NodeJS": true,
  },
  env: {
    browser: true,
    commonjs: true,
    es2023: true,
  },
  extends: [
    "eslint-config-standard",
    "eslint-config-love",
    "eslint-config-prettier",
    "plugin:unicorn/all",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2023,
    project: true,
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-import",
    "eslint-plugin-prettier",
    "eslint-plugin-promise",
    "eslint-plugin-tsdoc",
    "eslint-plugin-unicorn",
  ],
  rules: {
    "import/newline-after-import": ["error"],
    "import/order": ["error"],
    "tsdoc/syntax": ["error"],
    "prettier/prettier": ["error"],
    "unicorn/consistent-function-scoping": "off",
    // Using CommonJS not ESM.
    "unicorn/prefer-module": "off",
    // lgtv2 and node-ssdp modules uses EventEmitter.
    "unicorn/prefer-event-target": "off",
    // Not compatible with TypeScript.
    "unicorn/prefer-json-parse-buffer": "off",
    // Using CommonJS not ESM. Not supported by CommonJS.
    "unicorn/prefer-top-level-await": "off",

    "unicorn/no-null": "off",
    "unicorn/prevent-abbreviations": "off",
  },
};
