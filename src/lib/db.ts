// app/lib/db.ts
import { Pool } from 'pg';

// Verificar se todas as variáveis de ambiente estão definidas
const requiredEnvVars = {
  user: process.env.NEXT_PUBLIC_USER_DB,
  host: process.env.NEXT_PUBLIC_HOST_DB,
  database: process.env.NEXT_PUBLIC_DATABASE_DB,
  password: process.env.NEXT_PUBLIC_PASSWORD_DB,
};

// Log das variáveis (sem expor senhas)
console.log('Database config:', {
  user: requiredEnvVars.user,
  host: requiredEnvVars.host,
  database: requiredEnvVars.database,
  hasPassword: !!requiredEnvVars.password,
});

const pool = new Pool({
  user: requiredEnvVars.user,
  host: requiredEnvVars.host,
  database: requiredEnvVars.database,
  password: requiredEnvVars.password,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Configurações adicionais para estabilidade
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão na inicialização
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export default pool;