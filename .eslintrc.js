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
    
    // Jest test file specific relaxations
    'overrides': [
      {
        'files': ['**/*.test.js', '**/*.spec.js'],
        'rules': {
          'no-console': 'off',
        }
      }
    ]
  },
};
