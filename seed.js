const { openDb } = require('./src/database/connection');
const bcrypt = require('bcrypt');

async function setup() {
  const db = await openDb();

  // 1. Criar Tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS gestores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('geral', 'abrigo')) DEFAULT 'geral',
      abrigo_id INTEGER,
      FOREIGN KEY (abrigo_id) REFERENCES abrigos(id)
    );

    CREATE TABLE IF NOT EXISTS abrigos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      endereco TEXT,
      bairro TEXT,
      vagas INTEGER DEFAULT 0,
      ocupadas INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mensagem TEXT NOT NULL,
      nivel TEXT CHECK(nivel IN ('critico', 'medio', 'baixo')) DEFAULT 'baixo',
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS desaparecidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      status TEXT CHECK(status IN ('procurado', 'encontrado')) DEFAULT 'procurado',
      foto TEXT
    );

    CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      prioridade BOOLEAN DEFAULT 0,
      abrigo_id INTEGER,
      FOREIGN KEY (abrigo_id) REFERENCES abrigos(id)
    );

    CREATE TABLE IF NOT EXISTS voluntarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      area TEXT,
      abrigo_id INTEGER,
      FOREIGN KEY (abrigo_id) REFERENCES abrigos(id)
    );
  `);

  // LIMPEZA PARA EVITAR DUPLICADOS (Apenas para desenvolvimento/estudo)
  await db.run('DELETE FROM voluntarios');
  await db.run('DELETE FROM abrigos');
  await db.run('DELETE FROM desaparecidos');
  await db.run('DELETE FROM alertas');

  // 2. Criar Gestor Admin Inicial
  const senhaHash = await bcrypt.hash('admin123', 10);
  await db.run(
    'INSERT OR IGNORE INTO gestores (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
    ['Administrador Geral', 'admin@crise.com', senhaHash, 'geral']
  );

  // 3. Dados Iniciais de Abrigos (IDs serão 1 e 2)
  await db.run('INSERT INTO abrigos (id, nome, bairro, vagas, ocupadas, endereco) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 'Escola Central', 'Centro', 100, 45, 'Rua Principal, 10']);
  
  await db.run('INSERT INTO abrigos (id, nome, bairro, vagas, ocupadas, endereco) VALUES (?, ?, ?, ?, ?, ?)',
    [2, 'Ginásio Municipal', 'Norte', 200, 180, 'Av. Esportes, 500']);

  // 4. Voluntários de Exemplo
  await db.run('INSERT INTO voluntarios (nome, area, abrigo_id) VALUES (?, ?, ?)', ['João Silva', 'Cozinha', 1]);
  await db.run('INSERT INTO voluntarios (nome, area, abrigo_id) VALUES (?, ?, ?)', ['Maria Santos', 'Saúde', 1]);
  await db.run('INSERT INTO voluntarios (nome, area, abrigo_id) VALUES (?, ?, ?)', ['Carlos Lima', 'Limpeza', 2]);
  await db.run('INSERT INTO voluntarios (nome, area, abrigo_id) VALUES (?, ?, ?)', ['Ana Paula', 'Triagem', 2]);

  // 5. Desaparecidos de Exemplo
  await db.run('INSERT INTO desaparecidos (nome, status) VALUES (?, ?)', ['Fernando Souza', 'procurado']);
  await db.run('INSERT INTO desaparecidos (nome, status) VALUES (?, ?)', ['Amanda Costa', 'procurado']);

  console.log("✅ Banco de Dados Resetado e Populado com Sucesso!");
}

setup();
