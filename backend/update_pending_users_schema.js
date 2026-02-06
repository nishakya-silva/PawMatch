const db = require('./config/db');

async function updatePendingUsersSchema() {
    try {
        console.log('Updating pending_users table schema...');

        // Add role column to pending_users if it doesn't exist
        try {
            await db.query(`ALTER TABLE pending_users ADD COLUMN role VARCHAR(20) DEFAULT 'adopter' AFTER phone_number`);
            console.log('Added column role to pending_users');
        } catch (e) {
            console.log('Column role might already exist or error:', e.message);
        }

        // Add shelter_name column to pending_users if it doesn't exist
        try {
            await db.query(`ALTER TABLE pending_users ADD COLUMN shelter_name VARCHAR(255) AFTER role`);
            console.log('Added column shelter_name to pending_users');
        } catch (e) {
            console.log('Column shelter_name might already exist or error:', e.message);
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error updating schema:', error);
        process.exit(1);
    }
}

updatePendingUsersSchema();
