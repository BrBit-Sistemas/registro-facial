const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 8081;

// Middleware
app.use(cors({
  origin: "http://localhost:8080", // Fallback para dev
  credentials: true
}));
app.use(express.json());

// Configuração do pool de conexão PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_sagepra',
  password: 'postgres',
  port: 5432,
});


// Testar conexão com o banco de dados
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
    console.log('Verifique suas credenciais no arquivo .env');
  } else {
    console.log('Conexão bem-sucedida com o PostgreSQL');
    release();
  }
});

// Rota para verificar status do servidor
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para verificar status do banco
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    res.json({
      success: true,
      dbStatus: 'Conectado',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Erro de conexão com o banco: ' + err.message
    });
  }
});

// GET - Buscar todos os registros
app.get('/api/dados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.leitura_biometrica_detento');
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// POST - Criar novo registro
app.post('/api/dados', async (req, res) => {
  const { numserie, dtadm, senha, chave } = req.body;
  
  // Validação básica
  if (!numserie || !dtadm) {
    return res.status(400).json({
      success: false,
      error: 'Campos numserie e dtadm são obrigatórios'
    });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO cadfun (numserie, dtadm, senha, chave) VALUES ($1, $2, $3, $4) RETURNING *',
      [numserie, dtadm, senha, chave]
    );
    
    res.status(201).json({
      success: true,
      message: 'Registro criado com sucesso',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao criar registro:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada: ' + req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
});

process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  await pool.end();
  process.exit(0);
});