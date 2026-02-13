module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './website/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  ignorePatterns: [
    '.eslintrc.cjs',
    'vite.config.ts',
    'vitest.config.ts',
    'vitest.setup.ts',
    'tsup.config.ts',
  ],
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: false,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
            printWidth: 120,
          },
        ],
        'max-len': [
          'error',
          {
            code: 140,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreComments: true,
          },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          { allowNumber: true, allowBoolean: true, allowNullish: true },
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        'no-inline-comments': 'error',
        'max-lines-per-function': [
          'error',
          {
            max: 30,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'sonarjs/cognitive-complexity': 'error',
        'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
        'sonarjs/no-identical-expressions': 'error',
        'sonarjs/no-small-switch': 'error',
        'sonarjs/prefer-immediate-return': 'error',
        'sonarjs/prefer-object-literal': 'error',
        'sonarjs/prefer-single-boolean-return': 'error',
        'sonarjs/prefer-while': 'error',
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        'max-lines-per-function': [
          'error',
          {
            max: 40,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-statements': ['error', 25, { ignoreTopLevelFunctions: true }],
        'react/react-in-jsx-scope': 'off',
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
            printWidth: 120,
          },
        ],
        'max-len': [
          'error',
          {
            code: 140,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreComments: true,
          },
        ],
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'max-lines-per-function': 'off',
        'max-statements': ['error', 51, { ignoreTopLevelFunctions: true }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        'no-useless-escape': 'off',
        'no-inline-comments': 'error',
      },
    },
  ],
};
