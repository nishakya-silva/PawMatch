const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
            ADD COLUMN sms_alerts BOOLEAN DEFAULT FALSE;
        `);
        console.log('Added notification columns to users table.');

        await connection.end();
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
        if (connection) await connection.end();
    }
}

migrate();
