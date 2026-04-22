# 🖥️ Central de Crise - Backend API

Esta é a API REST que alimenta a plataforma Central de Crise. Ela gerencia a autenticação, controle de abrigos, voluntários, doações e alertas.

---

## 🛠️ Tecnologias e Dependências
- **Express 5**: Framework web minimalista e rápido.
- **SQLite 3**: Banco de dados relacional que não requer instalação de servidor externo.
- **Bcrypt**: Para hashing seguro de senhas.
- **JWT**: Para geração de tokens de acesso.
- **Nodemon**: Para reinicialização automática durante o desenvolvimento.

---

## ⚙️ Instalação e Uso

1. Entre na pasta do backend:
   ```bash
   cd Back
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. (Opcional) Popule o banco de dados com dados iniciais:
   ```bash
   node seed.js
   ```

4. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

O servidor estará rodando em `http://localhost:3000`.

---

## 📂 Estrutura de Pastas
- `src/controllers/`: Lógica de negócio e manipulação de requisições.
- `src/database/`: Configuração da conexão com SQLite e arquivo `.sqlite`.
- `src/routes/`: Definição dos endpoints da API.
- `seed.js`: Script para resetar e popular o banco de dados.

---

## 🔒 Endpoints Principais
- `POST /login`: Autenticação de usuários.
- `GET /abrigos`: Listagem de todos os abrigos.
- `PUT /abrigos/:id`: Atualização de ocupação (requer token).
- `GET /alertas`: Lista de alertas ativos para o cidadão.
- `POST /alertas`: Emissão de novo alerta (admin apenas).
