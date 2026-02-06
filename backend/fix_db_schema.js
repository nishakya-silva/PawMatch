const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    console.log('Connecting to database...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'pawmatch');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });
        console.log('Connected successfully!');

        const queries = [
            `ALTER TABLE pending_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'adopter' AFTER phone_number`,
            `ALTER TABLE pending_users ADD COLUMN IF NOT EXISTS shelter_name VARCHAR(255) AFTER role`
        ];

        // Since MySQL might not support ADD COLUMN IF NOT EXISTS in all versions, 
        // we'll try to add them and catch errors

        try {
            await connection.query(`ALTER TABLE pending_users ADD COLUMN role VARCHAR(20) DEFAULT 'adopter' AFTER phone_number`);
            console.log('Added role column');
        } catch (e) {
            console.log('Role column skipped:', e.message);
        }

        try {
            await connection.query(`ALTER TABLE pending_users ADD COLUMN shelter_name VARCHAR(255) AFTER role`);
            console.log('Added shelter_name column');
        } catch (e) {
            console.log('Shelter_name column skipped:', e.message);
        }

        console.log('Migration finished.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

runMigration();
