const express = require('express');
const AppError = require('./utils/appError');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. MIDDLEWARES GLOBAIS
// Middleware para permitir que o Express parseie JSON no corpo das requisições
app.use(express.json());

// -------------------------------------------------------------
// --- MIDDLEWARE DE LOG ---
// -------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`LOG: ${new Date().toISOString()} - ${req.method} ${req.url}`);
        next(); // Chama o próximo middleware ou a próxima função de rota
    });
}

// 2. ROTAS
// Rota de "saúde" da API para verificar se está online
app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

// Monta o roteador de usuários no endpoint '/users'
// Todas as rotas definidas em userRoutes serão prefixadas com /users
app.use('/users', userRoutes);

// 3. TRATAMENTO DE ROTAS NÃO ENCONTRADAS (404)
// Este middleware é acionado se nenhuma das rotas acima corresponder à requisição
app.use((req, res, next) => {
  next(new AppError(`Não foi possível encontrar ${req.originalUrl} neste servidor!`, 404));
});

// 4. MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS

// Função para tratar erros de campos duplicados do banco de dados
const handleDuplicateFieldsDB = (err) => {
  // Usa uma expressão regular para extrair o valor entre aspas da mensagem de erro
  const value = err.sqlMessage.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor, use outro valor.`;
  // Retorna um novo AppError com status 409 (Conflict)
  return new AppError(message, 409);
};

app.use((err, req, res, next) => {
  // Define valores padrão para o erro, caso não sejam especificados
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Clona o objeto de erro para evitar mutações inesperadas
  let error = { ...err };
  error.message = err.message;
  error.sqlMessage = err.sqlMessage; // Copia a mensagem SQL para análise

  // Transforma erros específicos do banco em erros operacionais amigáveis
  if (error.code === 'ER_DUP_ENTRY') {
    error = handleDuplicateFieldsDB(error);
  }

  // Se o erro for operacional (um erro que criamos e confiamos na mensagem)
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  
  // Se for um erro de programação ou desconhecido, não vaze detalhes
  // 1. Logue o erro no console para o desenvolvedor
  console.error('ERROR 💥', err); 
  
  // 2. Envie uma resposta genérica para o cliente
  return res.status(500).json({
    status: 'error',
    message: 'Algo deu muito errado!',
  });
});

// 5. EXPORTAÇÃO
// Exporta a instância do app para ser usada em outros arquivos (como o server.js)
module.exports = app;