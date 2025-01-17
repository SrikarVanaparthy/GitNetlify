module.exports = {
    transform: {
      '^.+\\.[t|j]sx?$': 'babel-jest',  // Handle both .js and .jsx files
    },
    testEnvironment: 'jsdom',
    transformIgnorePatterns: ['/node_modules/'],  // Ensure node_modules are not ignored if needed
  };
   