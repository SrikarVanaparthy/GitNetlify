module.exports = {
    presets: [
      '@babel/preset-react',
      '@babel/preset-env',  // Ensure it can handle ES modules
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',  // Optional: Transforms ESM into CommonJS
    ],
  };