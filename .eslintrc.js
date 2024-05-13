module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2023: true,
  },
  extends: [
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2023,
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc",
    "prettier",
  ],
  rules: {
    "no-redeclare": "off",
    "tsdoc/syntax": ["error"],
    "prettier/prettier": ["error"],
    "@typescript-eslint/no-namespace": "off",
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
