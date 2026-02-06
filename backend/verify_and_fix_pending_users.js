const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSchema() {
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

        // Check columns in pending_users
        const [columns] = await connection.query('SHOW COLUMNS FROM pending_users');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns in pending_users:', columnNames);

        const requiredColumns = [
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'email', type: 'VARCHAR(255)' },
            { name: 'password_hash', type: 'VARCHAR(255)' },
            { name: 'phone_number', type: 'VARCHAR(20)' },
            { name: 'role', type: "VARCHAR(20) DEFAULT 'adopter'" },
            { name: 'shelter_name', type: 'VARCHAR(255)' },
            { name: 'is_verified', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'nic', type: 'VARCHAR(20)' },
            { name: 'otp_hash', type: 'VARCHAR(255)' },
            { name: 'otp_expires_at', type: 'DATETIME' }
        ];

        for (const col of requiredColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding missing column: ${col.name}`);
                await connection.query(`ALTER TABLE pending_users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('Schema verification and fix complete.');
    } catch (error) {
        console.error('Failed to fix schema:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

fixSchema();
