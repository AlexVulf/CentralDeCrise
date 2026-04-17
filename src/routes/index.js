const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { openDb } = require('../database/connection');

const routes = Router();
const SECRET_KEY = 'crise-central-super-secret'; // Mantenha isso em um .env futuramente

// --- ROTAS DE AUTENTICAÇÃO E CADASTRO ---

// 1. Cadastro de Gestores
routes.post('/cadastro', async (req, res) => {
  const { nome, email, senha, tipo, abrigo_id } = req.body;
  const db = await openDb();

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    await db.run(
      'INSERT INTO gestores (nome, email, senha, tipo, abrigo_id) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, tipo, abrigo_id]
    );
    res.status(201).json({ message: "Gestor cadastrado com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao cadastrar gestor (Email já pode estar em uso)." });
  }
});

// 2. Login
routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const db = await openDb();

  const gestor = await db.get('SELECT * FROM gestores WHERE email = ?', [email]);

  if (!gestor) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const senhaCorreta = await bcrypt.compare(senha, gestor.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { id: gestor.id, tipo: gestor.tipo, abrigo_id: gestor.abrigo_id },
    SECRET_KEY,
    { expiresIn: '8h' }
  );

  res.json({ token, gestor: { id: gestor.id, nome: gestor.nome, tipo: gestor.tipo, abrigo_id: gestor.abrigo_id } });
});

// --- ROTAS DE ABRIGOS ---

// Listar todos os abrigos
routes.get('/abrigos', async (req, res) => {
  const db = await openDb();
  const abrigos = await db.all('SELECT * FROM abrigos');
  res.json(abrigos);
});

// Obter um abrigo específico
routes.get('/abrigos/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  const abrigo = await db.get('SELECT * FROM abrigos WHERE id = ?', [id]);
  res.json(abrigo);
});

// Atualizar vagas de um abrigo (Somente o gestor do abrigo ou admin)
routes.put('/abrigos/:id', async (req, res) => {
  const { id } = req.params;
  const { ocupadas } = req.body;
  const db = await openDb();

  await db.run('UPDATE abrigos SET ocupadas = ? WHERE id = ?', [ocupadas, id]);
  res.json({ message: "Vagas atualizadas com sucesso!" });
});

// --- ROTAS DE ALERTAS ---

routes.get('/alertas', async (req, res) => {
  const db = await openDb();
  const alertas = await db.all('SELECT * FROM alertas ORDER BY data_criacao DESC LIMIT 1');
  res.json(alertas);
});

routes.post('/alertas', async (req, res) => {
  const { mensagem, nivel } = req.body;
  const db = await openDb();
  await db.run('INSERT INTO alertas (mensagem, nivel) VALUES (?, ?)', [mensagem, nivel]);
  res.status(201).json({ message: "Alerta emitido!" });
});

// --- ROTAS DE DESAPARECIDOS ---

routes.get('/desaparecidos', async (req, res) => {
  const db = await openDb();
  const desaparecidos = await db.all('SELECT * FROM desaparecidos');
  res.json(desaparecidos);
});

// --- ROTAS DE VOLUNTÁRIOS ---

routes.get('/voluntarios', async (req, res) => {
  const db = await openDb();
  // Busca voluntários e o nome do abrigo atual deles
  const voluntarios = await db.all(`
    SELECT v.*, a.nome as abrigo_nome 
    FROM voluntarios v 
    LEFT JOIN abrigos a ON v.abrigo_id = a.id
  `);
  res.json(voluntarios);
});

routes.put('/voluntarios/:id/remanejar', async (req, res) => {
  const { id } = req.params;
  const { abrigo_id } = req.body;
  const db = await openDb();
  
  await db.run('UPDATE voluntarios SET abrigo_id = ? WHERE id = ?', [abrigo_id, id]);
  res.json({ message: "Voluntário remanejado com sucesso!" });
});

module.exports = routes;
