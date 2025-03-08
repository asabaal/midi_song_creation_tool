module.exports = {
  env: {
    'cypress/globals': true
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
