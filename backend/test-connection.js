// test-connection.js
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'db_sagepra',
  password: 'postgres',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('✅ Conectado ao PostgreSQL!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('✅ Query executada:', result.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ Erro de conexão:', err.message);
    client.end();
  });