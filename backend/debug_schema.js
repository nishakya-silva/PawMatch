const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));

        const [pCols] = await connection.query('SHOW COLUMNS FROM pending_users');
        console.log('PENDING_USERS COLUMNS:');
        pCols.forEach(c => console.log(` - ${c.Field}: ${c.Type}`));

        const [uCols] = await connection.query('SHOW COLUMNS FROM users');
        console.log('USERS COLUMNS:');
        uCols.forEach(c => console.log(` - ${c.Field}: ${c.Type}`));

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
debugSchema();
