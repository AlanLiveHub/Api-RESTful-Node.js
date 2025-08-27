// db.js

const knex = require('knex');
const knexConfig = require('./knexfile'); // Importa as configurações do knexfile

// Define o ambiente a ser utilizado (development, production, etc.)
// Pega do ambiente do sistema ou usa 'development' como padrão
const environment = process.env.NODE_ENV || 'development';

// Cria a instância do Knex com a configuração do ambiente correto
const db = knex(knexConfig[environment]);

// Exporta a instância do Knex para ser usada em outras partes da aplicação
module.exports = db;