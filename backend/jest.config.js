module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    // Si uuid pose problème, on peut mapper vers une version spécifique ou ignorer
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)" // Autoriser Jest à transformer uuid si nécessaire
  ],
  // Solution rapide pour uuid v9+ en CommonJS
  resolver: undefined,
};
