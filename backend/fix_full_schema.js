const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixFullSchema() {
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

        // Fix pending_users
        const [pendingCols] = await connection.query('SHOW COLUMNS FROM pending_users');
        const pendingColNames = pendingCols.map(c => c.Field);

        const requiredPending = [
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

        for (const col of requiredPending) {
            if (!pendingColNames.includes(col.name)) {
                await connection.query(`ALTER TABLE pending_users ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added ${col.name} to pending_users`);
            }
        }

        // Fix users
        const [userCols] = await connection.query('SHOW COLUMNS FROM users');
        const userColNames = userCols.map(c => c.Field);

        const requiredUsers = [
            { name: 'role', type: "VARCHAR(20) DEFAULT 'adopter'" },
            { name: 'shelter_name', type: 'VARCHAR(255)' },
            { name: 'otp_hash', type: 'VARCHAR(255)' },
            { name: 'otp_expires_at', type: 'DATETIME' },
            { name: 'nic', type: 'VARCHAR(20)' }
        ];

        for (const col of requiredUsers) {
            if (!userColNames.includes(col.name)) {
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added ${col.name} to users`);
            }
        }

        console.log('Final check of pending_users columns:');
        const [finalPending] = await connection.query('SHOW COLUMNS FROM pending_users');
        console.log(finalPending.map(c => c.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

fixFullSchema();
