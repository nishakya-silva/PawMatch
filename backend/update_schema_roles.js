const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Updating schema...');

        // Add role column if not exists
        try {
            await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'adopter'");
            console.log("Added role column");
        } catch (e) {
            console.log("role column might already exist or error:", e.message);
        }

        // Add shelter_name column if not exists
        try {
            await db.query("ALTER TABLE users ADD COLUMN shelter_name VARCHAR(255)");
            console.log("Added shelter_name column");
        } catch (e) {
            console.log("shelter_name column might already exist or error:", e.message);
        }

        console.log('Schema update complete');
        process.exit(0);
    } catch (error) {
        console.error('Schema Update Error:', error);
        process.exit(1);
    }
}

updateSchema();
