// src/utils/authController.js

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./appError');
const catchAsync = require('./catchAsync');
const db = require('../../db');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. Verificar se o token existe e está no cabeçalho Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Você não está logado. Por favor, faça o login para obter acesso.', 401));
  }

  // 2. Verificar a validade do token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Verificar se o usuário do token ainda existe
  const currentUser = await db('users').where({ uuid: decoded.uuid }).whereNull('deleted_at').first();
  if (!currentUser) {
    return next(new AppError('O usuário pertencente a este token não existe mais.', 401));
  }

  // CONCEDE ACESSO À ROTA PROTEGIDA
  req.user = currentUser; // Anexa o usuário à requisição
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 'roles' é um array, ex: ['admin', 'lead-guide']
    // O req.user foi definido no middleware 'protect' que rodou antes
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para realizar esta ação.', 403) // 403 Forbidden
      );
    }

    // Se o papel do usuário está na lista de papéis permitidos, continue
    next();
  };
};