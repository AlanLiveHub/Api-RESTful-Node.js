# API RESTful com Node.js e MySQL

API RESTful completa construída com Node.js, Express e MySQL. O projeto possui arquitetura limpa, segurança, autenticação baseada em JWT, autorização por papéis e testes automatizados.

## ✨ Funcionalidades

-   **CRUD de Usuários:** Operações completas de Criação, Leitura, Atualização e Deleção de usuários.
-   **Autenticação JWT:** Sistema de login seguro que gera JSON Web Tokens para autenticação de usuários.
-   **Autorização por Papéis (Roles):** Sistema de permissões que diferencia usuários comuns (`user`) de administradores (`admin`), protegendo rotas específicas.
-   **Validação de Dados:** Validação robusta dos dados de entrada para garantir a integridade das informações.
-   **Segurança de Senhas:** Armazenamento seguro de senhas utilizando hashing com `bcryptjs`.
-   **Soft Delete:** Registros não são permanentemente deletados, permitindo recuperação e manutenção de histórico.
-   **Tratamento de Erros Centralizado:** Middleware global para capturar e formatar todos os erros da aplicação de forma consistente.
-   **Testes Automatizados:** Suíte de testes de integração para garantir a estabilidade e o correto funcionamento da API.

## 🚀 Tecnologias Utilizadas

### Backend
-   **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript.
-   **[Express.js](https://expressjs.com/)**: Framework web minimalista e flexível para Node.js.
-   **[MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/)**: Banco de dados relacional para armazenamento de dados.
-   **[Knex.js](https://knexjs.org/)**: SQL Query Builder para Node.js, utilizado para interagir com o banco de dados e gerenciar migrations.

### Segurança e Autenticação
-   **[JSON Web Token (JWT)](https://jwt.io/)**: Para criar tokens de acesso que permitem a autenticação segura.
-   **[bcrypt.js](https://github.com/dcodeIO/bcrypt.js)**: Para hashing e comparação de senhas de forma segura.
-   **[express-validator](https://express-validator.github.io/)**: Para validação e sanitização dos dados recebidos nas requisições.
-   **[dotenv](https://github.com/motdotla/dotenv)**: Para gerenciar variáveis de ambiente e manter as credenciais seguras.

### Testes
-   **[Jest](https://jestjs.io/)**: Framework de testes JavaScript "tudo em um".
-   **[Supertest](https://github.com/visionmedia/supertest)**: Biblioteca para testar APIs e endpoints HTTP.
-   **[cross-env](https://github.com/kentcdodds/cross-env)**: Para definir variáveis de ambiente de forma compatível entre diferentes sistemas operacionais.

## 📋 Pré-requisitos

-   Node.js (versão 18.x ou superior)
-   NPM ou Yarn
-   MySQL ou MariaDB instalado e rodando
-   Um cliente de banco de dados (DBeaver, DataGrip, etc.) para criar o banco de dados inicial.

## ⚙️ Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/AlanLiveHub/Api-RESTful-Node.js.git
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto, copiando o exemplo do `.env.example`.

4.  **Crie os bancos de dados:**
    Conecte-se ao seu servidor de banco de dados e crie o banco de acordo com seu .env.
  

5.  **Rode as migrations do banco de dados:**
    Este comando criará todas as tabelas necessárias no seu banco de desenvolvimento.
    ```bash
    npx knex migrate:latest
    ```

## 🚀 Executando a Aplicação


-   **Para iniciar em modo de produção:**
    ```bash
    npm start
    ```
    O servidor estará rodando em `http://localhost:3077`.

## 🧪 Rodando os Testes

Para garantir que a aplicação está funcionando corretamente, execute a suíte de testes. Os testes usarão o banco de dados `minha_api_node_test`.
```bash
npm test
```

## 📝 Endpoints da API

Os endpoints utilizados estão abaixo:

-   `GET /`: Principal - mensagem de boas vindas.
-   `POST /users/register`: Cria um novo usuário.
-   `POST /users/login`: Autentica um usuário e retorna um token JWT.
-   `GET /users`: (Protegido, Admin) Lista todos os usuários.
-   `GET /users/:uuid`: (Protegido) Busca um usuário específico.
-   `PUT /users/:uuid`: (Protegido) Atualiza um usuário específico.
-   `DELETE /users/:uuid`: (Protegido, Admin) Deleta (soft delete) um usuário específico.


