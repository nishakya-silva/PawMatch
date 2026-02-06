const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function fixMessagesSchema() {
    console.log('Connecting to database...');
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });
        console.log('Connected successfully!');

        const [columns] = await connection.query('SHOW COLUMNS FROM shelter_messages');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns in shelter_messages:', columnNames);

        if (!columnNames.includes('response')) {
            await connection.query('ALTER TABLE shelter_messages ADD COLUMN response TEXT AFTER message');
            console.log('Added response column');
        }

        if (!columnNames.includes('responded_at')) {
            await connection.query('ALTER TABLE shelter_messages ADD COLUMN responded_at TIMESTAMP NULL AFTER response');
            console.log('Added responded_at column');
        }

        console.log('Schema fix for shelter_messages complete.');
    } catch (error) {
        console.error('Failed to fix schema:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

fixMessagesSchema();
