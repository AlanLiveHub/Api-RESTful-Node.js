// app.js

require("dotenv").config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear o corpo das requisições com JSON
// Isso é NECESSÁRIO para que `req.body` funcione em requisições POST/PUT

// app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // Chama o próximo middleware ou a próxima função de rota
});

// Dados de exemplo (simulando um banco de dados por enquanto)
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// Rota GET para a raiz
app.get('/', (req, res) => {
  res.send('Bem-vindo à minha API de Usuários!');
});

// Rota GET para listar todos os usuários
app.get('/users', (req, res) => {
  res.json(users); // Retorna os usuários como JSON
});

// Rota GET para buscar um usuário por ID
app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id); // req.params contém os parâmetros da URL
  const user = users.find(u => u.id === id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado.' });
  }
});

// Rota POST para criar um novo usuário
app.post('/users', (req, res) => {
  const newUser = req.body; // req.body contém os dados enviados no corpo da requisição
  
  // Validação básica
  if (!newUser.name || !newUser.email) {
    return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
  }

  // Atribuir um novo ID
  newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  users.push(newUser);

  res.status(201).json(newUser); // Retorna o usuário criado com status 201 (Created)
});

// Rota PUT para atualizar um usuário existente por ID
app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedUserData = req.body;

  let userFound = false;
  users = users.map(user => {
    if (user.id === id) {
      userFound = true;
      return { ...user, ...updatedUserData }; // Atualiza os campos do usuário
    }
    return user;
  });

  if (userFound) {
    res.json({ message: 'Usuário atualizado com sucesso!', user: users.find(u => u.id === id) });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
  }
});

// Rota DELETE para remover um usuário por ID
app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);

  if (users.length < initialLength) {
    res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado para remoção.' });
  }
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});