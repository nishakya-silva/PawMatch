const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Updating database schema...');

        // Add otp_hash column
        try {
            await db.query(`ALTER TABLE users ADD COLUMN otp_hash VARCHAR(255)`);
            console.log('Added column: otp_hash');
        } catch (e) {
            console.log('Column otp_hash might already exist or error:', e.message);
        }

        // Add otp_expires_at column
        try {
            await db.query(`ALTER TABLE users ADD COLUMN otp_expires_at TIMESTAMP`);
            console.log('Added column: otp_expires_at');
        } catch (e) {
            console.log('Column otp_expires_at might already exist or error:', e.message);
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
