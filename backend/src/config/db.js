const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const checkDatabaseConnection = async () => {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
};

module.exports = {
  pool,
  checkDatabaseConnection,
};
