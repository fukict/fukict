module.exports = {
  plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
        onlyRemoveTypeImports: true,
      },
    ],
  ],
};
