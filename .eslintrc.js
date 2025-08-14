module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'no-dupe-keys': 'error'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};
