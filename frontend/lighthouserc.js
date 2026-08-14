/**
 * Lighthouse CI — scope v1 : routes publiques/non-authentifiées uniquement
 * (mêmes routes que les crawlers/aperçus sociaux voient réellement).
 * Couverture des routes authentifiées = amélioration future (Puppeteer
 * script de login dans `collect.puppeteerScript`), pas v1.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/marketplace',
        'http://localhost:4173/login',
        'http://localhost:4173/register',
        'http://localhost:4173/about',
        'http://localhost:4173/contact',
        'http://localhost:4173/faq',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
