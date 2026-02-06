const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkFinalSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });
        const [columns] = await connection.query('SHOW COLUMNS FROM pending_users');
        console.log('Final columns in pending_users:', columns.map(c => c.Field).join(', '));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
checkFinalSchema();
