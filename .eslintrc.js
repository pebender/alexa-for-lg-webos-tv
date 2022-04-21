module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error']
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
