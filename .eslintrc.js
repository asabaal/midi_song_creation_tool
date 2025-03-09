module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'prettier' // Add prettier last to override conflicting rules
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Error prevention
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-undef': 'error',
    
    // MIDI specific rules to ensure pattern correctness
    'max-len': ['warn', { code: 100, ignoreComments: true }],
    
    // Add prettier as a rule (will use your .prettierrc settings)
    'prettier/prettier': ['error']
  },
  plugins: [
    'prettier' // Add prettier plugin
  ],
  // Jest test file specific relaxations
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/*.test.jsx', '**/*.spec.jsx'],
      rules: {
        'no-console': 'off',
      }
    },
    // JSX files
    {
      files: ['**/*.jsx'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: 'readonly',
        ReactDOM: 'readonly'
      }
    }
  ],
  globals: {
    'expect': 'readonly',
    'describe': 'readonly',
    'it': 'readonly',
    'test': 'readonly',
    'beforeEach': 'readonly',
    'afterEach': 'readonly',
    'beforeAll': 'readonly',
    'afterAll': 'readonly',
  }
};