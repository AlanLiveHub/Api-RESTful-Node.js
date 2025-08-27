const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { validationResult } = require('express-validator'); // Importa a função de resultado

const activeUsersQuery = () => db('users').whereNull('deleted_at');

// Função para gerar um token JWT
const signToken = uuid => {
  return jwt.sign({ uuid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Lista todos os usuários
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await activeUsersQuery().select('uuid', 'name', 'email', 'created_at', 'updated_at');
  
  res.status(200).json({
    status: 'success',
    message: 'Usuários recuperados com sucesso.',
    data: {
      users,
    },
  });
});

// Busca um usuário por UUID
exports.getUserByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const user = await activeUsersQuery().where({ uuid }).select('uuid', 'name', 'email', 'created_at', 'updated_at').first();
  
  if (!user) {
    return next(new AppError('Nenhum usuário encontrado com este UUID.', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Usuário recuperado com sucesso.',
    data: {
      user,
    },
  });
});

// Cria um novo usuário
exports.createUser = catchAsync(async (req, res, next) => {
  // 1. Verifica se houve erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se houver erros, retorna uma resposta 400 com os detalhes
    return res.status(400).json({
      status: 'fail',
      message: 'Dados de entrada inválidos.',
      data: errors.array(), // errors.array() contém a lista de todos os erros
    });
  }

  const { name, email, password } = req.body;

  if (!name || !email) {
    return next(new AppError('Nome e email são obrigatórios.', 400));
  }

  // 1. Hashear a senha
  const hashedPassword = await bcrypt.hash(password, 12); // O 12 é o "custo" do hash

  // 2. Criar o usuário com a senha hasheada
  const newUser = { 
    uuid: uuidv4(), 
    name, 
    email, 
    password: hashedPassword // Salva a senha hasheada
  };
  
  await db('users').insert(newUser);

  const createdUser = await db('users')
    .where({ uuid: newUser.uuid })
    .select('uuid', 'name', 'email', 'created_at', 'updated_at')
    .first(); // .first() para obter o objeto diretamente, em vez de um array.

  // 3. Gerar um token JWT para o novo usuário
  const token = signToken(createdUser.uuid);

  res.status(201).json({
    status: 'success',
    message: 'Usuário criado com sucesso.',
    token, // Envia o token para o cliente
    data: {
      user: createdUser,
    },
  });
});

// Atualiza um usuário
exports.updateUser = catchAsync(async (req, res, next) => {
  // 1. Adiciona a verificação de validação aqui também
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Dados de entrada inválidos.',
      data: errors.array(),
    });
  }

  const { uuid } = req.params;
  const { name, email } = req.body;
  if (!name && !email) {
    return next(new AppError('Forneça pelo menos um campo para atualizar.', 400));
  }
  
  const userDataToUpdate = {};
  if (name) userDataToUpdate.name = name;
  if (email) userDataToUpdate.email = email;
  
  const affectedRows = await activeUsersQuery().where({ uuid }).update(userDataToUpdate);
  
  if (affectedRows === 0) {
    return next(new AppError('Nenhum usuário encontrado com este UUID para atualizar.', 404));
  }
  
  const updatedUser = await db('users').where({ uuid }).select('uuid', 'name', 'email', 'created_at', 'updated_at').first();

  res.status(200).json({
    status: 'success',
    message: 'Usuário atualizado com sucesso.',
    data: {
      user: updatedUser,
    },
  });
});

// Deleta (soft delete) um usuário
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const affectedRows = await activeUsersQuery().where({ uuid }).update({ deleted_at: new Date() });

  if (affectedRows === 0) {
    return next(new AppError('Nenhum usuário encontrado com este UUID para deletar.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Usuário deletado com sucesso.'
  });
});

// Restaura um usuário
exports.restoreUser = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const affectedRows = await db('users').where({ uuid }).update({ deleted_at: null });

  if (affectedRows === 0) {
    return next(new AppError('Nenhum usuário encontrado com este UUID para restaurar.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Usuário restaurado com sucesso.'
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validar se email e senha foram enviados
  if (!email || !password) {
    return next(new AppError('Por favor, forneça email e senha.', 400));
  }

  // 2. Buscar o usuário pelo email (incluindo a senha para comparação)
  const user = await db('users').where({ email }).whereNull('deleted_at').first();

  // 3. Se o usuário existir, comparar a senha enviada com a senha hasheada no banco
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Email ou senha incorretos.', 401)); // 401 Unauthorized
  }

  // 4. Se tudo estiver correto, gerar e enviar o token
  const token = signToken(user.uuid);

  // Remove a senha do objeto de usuário antes de enviar a resposta
  delete user.password;

  res.status(200).json({
    status: 'success',
    message: 'Login realizado com sucesso.',
    token,
    data: {
      user,
    },
  });
});