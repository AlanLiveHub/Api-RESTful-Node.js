const request = require('supertest');
const app = require('../app');
const db = require('../../db');

describe('User Endpoints', () => {
  let adminToken; // Renomeado para clareza

  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db('users').delete();

    const testAdmin = {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
    };
    
    // Cadastra o usuário que será nosso admin
    const registerResponse = await request(app).post('/users').send(testAdmin);
    const adminUuid = registerResponse.body.data.user.uuid;

    // --- CORREÇÃO APLICADA AQUI ---
    // Promove o usuário recém-criado para 'admin' diretamente no banco de dados
    await db('users').where({ uuid: adminUuid }).update({ role: 'admin' });
    // --- FIM DA CORREÇÃO ---

    // Faz login para obter o token de admin
    const loginResponse = await request(app).post('/users/login').send({
      email: testAdmin.email,
      password: testAdmin.password,
    });
    adminToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  // --- Início dos Testes ---

  it('should not allow access to GET /users without a token', async () => {
    await request(app)
      .get('/users')
      .expect(401);
  });
  
  it('should fetch all users for an admin user', async () => {
    // Cria um segundo usuário para garantir que a lista não esteja vazia
    await db('users').insert({ 
      uuid: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword'
    });

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`) // Usa o token de admin
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.users).toBeInstanceOf(Array);
    // Esperamos 2 usuários: o 'Test Admin' e a 'Jane Doe'
    expect(response.body.data.users.length).toBe(2); 
  });

  it('should NOT fetch all users for a regular user', async () => {
    // Para este teste, precisamos de um token de usuário comum
    const regularUser = { name: 'Regular User', email: 'user@example.com', password: 'password123' };
    await request(app).post('/users').send(regularUser);
    const loginResponse = await request(app).post('/users/login').send({ email: regularUser.email, password: regularUser.password });
    const regularUserToken = loginResponse.body.token;

    await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .expect(403); // Esperamos 403 Forbidden
  });
});