module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2023: true,
  },
  extends: ["standard", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2023,
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc",
    "prettier",
  ],
  rules: {
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": ["error"],
    "tsdoc/syntax": ["error"],
    "prettier/prettier": ["error"],
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
