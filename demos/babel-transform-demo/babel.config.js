module.exports = {
  presets: [['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
  plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
};
