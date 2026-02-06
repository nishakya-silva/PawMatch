const mysql = require('mysql2/promise');
require('dotenv').config();

async function addEverythingMissing() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });

        const tryAdd = async (table, col, type) => {
            try {
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
                console.log(`Added ${col} to ${table}`);
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME' || e.message.includes('Duplicate column')) {
                    // console.log(`${col} already in ${table}`);
                } else {
                    console.error(`Error adding ${col} to ${table}:`, e.message);
                }
            }
        };

        await tryAdd('pending_users', 'is_verified', 'BOOLEAN DEFAULT FALSE');
        await tryAdd('pending_users', 'role', "VARCHAR(20) DEFAULT 'adopter'");
        await tryAdd('pending_users', 'shelter_name', 'VARCHAR(255)');
        await tryAdd('pending_users', 'nic', 'VARCHAR(20)');
        await tryAdd('pending_users', 'otp_hash', 'VARCHAR(255)');
        await tryAdd('pending_users', 'otp_expires_at', 'DATETIME');

        await tryAdd('users', 'role', "VARCHAR(20) DEFAULT 'adopter'");
        await tryAdd('users', 'shelter_name', 'VARCHAR(255)');
        await tryAdd('users', 'nic', 'VARCHAR(20)');
        await tryAdd('users', 'otp_hash', 'VARCHAR(255)');
        await tryAdd('users', 'otp_expires_at', 'DATETIME');
        await tryAdd('users', 'is_verified', 'BOOLEAN DEFAULT FALSE');

        console.log('All missing columns processed.');
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
addEverythingMissing();
