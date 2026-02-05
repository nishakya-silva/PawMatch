const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Updating schema for verification...');

        const alterQueries = [
            "ALTER TABLE users ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified'",
            "ALTER TABLE users ADD COLUMN registry_type VARCHAR(50)",
            "ALTER TABLE users ADD COLUMN registration_number VARCHAR(50)",
            "ALTER TABLE users ADD COLUMN verification_document_url VARCHAR(500)"
        ];

        for (const query of alterQueries) {
            try {
                await db.query(query);
                console.log(`Executed: ${query}`);
            } catch (e) {
                console.log(`Query failed (might already exist): ${e.message}`);
            }
        }

        console.log('Schema update complete');
        process.exit(0);
    } catch (error) {
        console.error('Schema Update Error:', error);
        process.exit(1);
    }
}

updateSchema();
