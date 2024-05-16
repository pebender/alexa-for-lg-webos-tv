module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2023: true,
  },
  extends: [
    "eslint:recommended",
    "love",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2023,
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-import",
    "eslint-plugin-n",
    "eslint-plugin-promise",
    "eslint-plugin-tsdoc",
    "prettier",
  ],
  rules: {
    "import/newline-after-import": ["error"],
    "import/order": ["error"],
    "tsdoc/syntax": ["error"],
    "prettier/prettier": ["error"],
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/return-await": ["error"],
  },
};
