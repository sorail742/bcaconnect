/**
 * catchAsync.js — Utilitaire pour capturer les erreurs asynchrones dans les contrôleurs Express.
 * Évite de répéter les blocs try/catch et passe automatiquement l'erreur au middleware global.
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
