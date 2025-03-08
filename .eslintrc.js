module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module', // Add this to support import/export
    ecmaFeatures: {
      jsx: true, // Add this to support JSX
    },
  },
  rules: {
    // Error prevention
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-undef': 'error',
    
    // Style consistency
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // MIDI specific rules to ensure pattern correctness
    'max-len': ['warn', { code: 100, ignoreComments: true }],
  },
  // Jest test file specific relaxations
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/*.test.jsx', '**/*.spec.jsx'],
      rules: {
        'no-console': 'off',
      }
    },
    // Add specific configuration for Cypress files
    {
      files: ['**/cypress/**/*.js', '**/cypress/**/*.jsx', '**/*.cy.js', '**/*.cy.jsx'],
      env: {
        'cypress/globals': true
      },
      plugins: [
        'cypress'
      ],
      rules: {
        'cypress/no-assigning-return-values': 'error',
        'cypress/no-unnecessary-waiting': 'error',
        'no-unused-vars': 'warn',
        'no-console': 'off',
      }
    }
  ],
  plugins: [
    'cypress'
  ],
  globals: {
    'cy': 'readonly',
    'Cypress': 'readonly',
    'expect': 'readonly',
    'assert': 'readonly',
  }
};
