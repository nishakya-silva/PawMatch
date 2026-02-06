const db = require('./config/db');

async function updateShelterSchema() {
    try {
        console.log('Adding shelter profile columns...');

        const columns = [
            "ALTER TABLE users ADD COLUMN shelter_code VARCHAR(20) UNIQUE",
            "ALTER TABLE users ADD COLUMN shelter_description TEXT",
            "ALTER TABLE users ADD COLUMN shelter_address TEXT",
            "ALTER TABLE users ADD COLUMN shelter_logo_url VARCHAR(500)",
            "ALTER TABLE users ADD COLUMN shelter_banner_url VARCHAR(500)",
            "ALTER TABLE users ADD COLUMN shelter_social_links JSON",
            "ALTER TABLE users ADD COLUMN shelter_website VARCHAR(255)"
        ];

        for (const sql of columns) {
            try {
                await db.query(sql);
                console.log(`Executed: ${sql}`);
            } catch (e) {
                console.log(`Skipped (likely exists): ${sql}`);
            }
        }

        // Logic to generate unique shelter_codes for existing shelters
        const shelters = await db.query("SELECT id FROM users WHERE role = 'shelter' AND shelter_code IS NULL");
        for (let i = 0; i < shelters.rows.length; i++) {
            const shelterId = shelters.rows[i].id;
            const code = `PM-S-${String(shelterId).padStart(4, '0')}`;
            await db.query("UPDATE users SET shelter_code = ? WHERE id = ?", [code, shelterId]);
            console.log(`Assigned code ${code} to shelter ID ${shelterId}`);
        }

        console.log('Shelter profile schema updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating shelter schema:', error);
        process.exit(1);
    }
}

updateShelterSchema();
