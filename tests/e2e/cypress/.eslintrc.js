module.exports = {
  env: {
    cypress: true
  },
  plugins: [
    'cypress'
  ],
  extends: [
    'plugin:cypress/recommended'
  ],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'warn'
  }
};
