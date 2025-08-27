// src/routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../utils/authController'); // Corrigido o caminho se necessário

// Define as regras de validação para a criação de um usuário
const createUserValidationRules = [
  body('name').notEmpty().withMessage('O campo nome é obrigatório.'),
  body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.')
    .notEmpty().withMessage('A senha é obrigatória.')
];

// Define as regras de validação para a atualização de um usuário (campos opcionais)
const updateUserValidationRules = [
  body('name')
    .optional() // Torna o campo opcional
    .isLength({ min: 3 }).withMessage('O nome deve ter no mínimo 3 caracteres.'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Por favor, forneça um endereço de email válido.')
    .normalizeEmail(),
];

// --- ROTAS PÚBLICAS ---
router.post('/login', userController.login);
router.post('/', createUserValidationRules, userController.createUser); // Cadastro

// --- ROTAS PROTEGIDAS ---
// O middleware 'protect' será aplicado a todas as rotas definidas abaixo dele
router.use(authController.protect);

// Rota para listar todos os usuários (APENAS ADMIN)
router.get('/', authController.restrictTo('admin'), userController.getAllUsers); // Listar todos os usuários

router.route('/:uuid')
  .get(userController.getUserByUuid)
  .put(updateUserValidationRules, userController.updateUser)
  // Rota para deletar um usuário (APENAS ADMIN)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

// Rota para restaurar um usuário (APENAS ADMIN)
router.post('/:uuid/restore', authController.restrictTo('admin'), userController.restoreUser);

module.exports = router;