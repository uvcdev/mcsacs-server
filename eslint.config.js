const path = require('path');

module.exports = [
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'prettier': require('eslint-plugin-prettier'),
    },
    rules: {
      ...require('eslint-plugin-prettier').configs.recommended.rules,
      ...require('@typescript-eslint/eslint-plugin').configs.recommended.rules,
      ...require('@typescript-eslint/eslint-plugin').configs['recommended-requiring-type-checking'].rules,
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
    ignores: ['build/', 'node_modules/'],
  },
];
