const { getESLintImportOrderRule, getESLintImportSettings } = require('t-comm');

module.exports = {
  root: true,
  extends: ['eslint-config-light-vue3'],
  globals: {
    getCurrentPages: true,
    globalThis: true,
    uni: true,
    qq: true,
    wx: true,
    requirePlugin: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    extraFileExtensions: ['.vue'],
  },
  overrides: [
    {
      files: ['*.mjs'],
      parserOptions: {
        project: 'tsconfig.eslint.json',
        sourceType: 'module',
      },
    },
    {
      files: ['*.js', '*.ts'],
      excludedFiles: ['*.test.js', '*.spec.js'],
      parserOptions: {
        project: 'tsconfig.eslint.json',
      },
    },
    {
      files: [
        'src/packages/**/*',
      ],
      excludedFiles: [
        '**/*/demo.vue',
        '**/*/demo-helper/**/*',
      ],
      rules: {
        'no-alert': 2,
      },
    },
  ],
  settings: {
    ...getESLintImportSettings(),
  },
  rules: {
    ...getESLintImportOrderRule(),
    'light/no-import-all-in-one-api': 2,
    'light/valid-file-name': [2, {
      exclude: [
        'src/App.vue',
        'src/utils/i18n/lang/*.{js,ts}',
        'src/packages/locale/lang/*.{js,ts}',
      ],
    }],
    'light/no-js-file': 2,
    'light/valid-spelling': 2,
    'light/valid-shaohou': 2,
    'light/classname-per-line': 2,
  },
};
