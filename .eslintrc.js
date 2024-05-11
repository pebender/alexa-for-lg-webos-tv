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
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/no-duplicate-type-constituents": "off",
    "@typescript-eslint/no-dynamic-delete": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/only-throw-error": "off",
    "@typescript-eslint/prefer-promise-reject-errors": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
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
