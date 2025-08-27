// server.js

// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config(); 

// Importa o módulo 'net' para a verificação da porta
const net = require('net');

// Importa a configuração do app Express
const app = require('./src/app'); 

const PORT = process.env.PORT || 3000;

// Cria um servidor de teste para verificar a disponibilidade da porta
const portChecker = net.createServer();

// Tenta "escutar" na porta. Se der erro, a porta está em uso.
portChecker.once('error', (err) => {
  // Verifica se o erro é de "endereço em uso"
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERRO: A porta ${PORT} já está em uso.`);
    console.log('Verifique se outra instância da aplicação já está rodando ou se outro serviço está usando esta porta.');
    // Encerra o processo, já que não podemos iniciar o servidor
    process.exit(1); 
  } else {
    // Para outros erros inesperados
    console.error('Ocorreu um erro inesperado ao verificar a porta:', err);
    process.exit(1);
  }
});

// Se o servidor de teste conseguir "escutar", a porta está livre.
portChecker.once('listening', () => {
  console.log('✅ Porta disponível. Iniciando o servidor...');
  // Fecha o servidor de teste imediatamente para liberar a porta
  portChecker.close(() => {
    // Agora que a porta está livre, inicia o servidor Express real
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado com sucesso na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  });
});

// Inicia o processo de verificação
console.log(`Verificando a disponibilidade da porta ${PORT}...`);
portChecker.listen(PORT);