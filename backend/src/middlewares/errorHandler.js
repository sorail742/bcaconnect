const AppError = require('../utils/AppError');

const handleDuplicateFieldsDB = err => {
  const value = err.errors ? err.errors[0].message : 'champ';
  const message = `Valeur dupliquée : ${value}. Veuillez utiliser une autre valeur !`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données invalides. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Jeton invalide. Veuillez vous reconnecter !', 401);

const handleJWTExpiredError = () => new AppError('Votre jeton a expiré ! Veuillez vous reconnecter.', 401);

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code || 'SERVER_ERROR'
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR'
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur interne est survenue (Standard BCA v2.6)',
      code: 'SERVER_ERROR'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Sequelize / JWT — même mapping en dev et prod pour des messages 400 lisibles
  if (error.name === 'SequelizeUniqueConstraintError') error = handleDuplicateFieldsDB(error);
  if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

module.exports = errorHandler;
