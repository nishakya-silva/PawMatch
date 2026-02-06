const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyColumns() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pawmatch'
        });

        const [pCols] = await connection.query('SHOW COLUMNS FROM pending_users');
        const pNames = pCols.map(c => c.Field);

        console.log('--- VERIFYING PENDING_USERS ---');
        ['is_verified', 'role', 'shelter_name', 'nic', 'otp_hash', 'otp_expires_at'].forEach(col => {
            if (pNames.includes(col)) {
                console.log(`[OK] pending_users has column: ${col}`);
            } else {
                console.log(`[MISSING] pending_users lacks column: ${col}`);
            }
        });

        const [uCols] = await connection.query('SHOW COLUMNS FROM users');
        const uNames = uCols.map(c => c.Field);

        console.log('--- VERIFYING USERS ---');
        ['role', 'shelter_name', 'nic', 'otp_hash', 'otp_expires_at'].forEach(col => {
            if (uNames.includes(col)) {
                console.log(`[OK] users has column: ${col}`);
            } else {
                console.log(`[MISSING] users lacks column: ${col}`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
verifyColumns();
