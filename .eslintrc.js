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
    "plugin:unicorn/recommended",
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
    "unicorn/prefer-module": "off",
    "unicorn/prefer-event-target": "off",

    "unicorn/catch-error-name": "off",
    // "unicorn/catch-error-name": ["error", {"ignore": ["cause"]}],
    "unicorn/no-null": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/prefer-top-level-await": "off",
    "unicorn/prevent-abbreviations": "off",
  },
};
