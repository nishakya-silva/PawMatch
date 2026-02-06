const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pawmatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  pool,
  query: async (sql, params = []) => {
    // Use .query instead of .execute for broader support (e.g. START TRANSACTION)
    const [results] = await pool.query(sql, params);
    return { rows: results }; // Maintain compatibility with pg style { rows: [] } return
  }
};
