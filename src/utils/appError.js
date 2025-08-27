// classe de erro customizada
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // 'fail' para 4xx, 'error' para 5xx
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Para sabermos que é um erro que criamos

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;