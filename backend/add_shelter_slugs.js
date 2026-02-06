const db = require('./config/db');

async function updateShelterSchema() {
    try {
        console.log('Adding shelter profile columns and slug...');

        const columns = [
            "ALTER TABLE users ADD COLUMN shelter_slug VARCHAR(255) UNIQUE",
            "ALTER TABLE users ADD COLUMN shelter_tagline VARCHAR(255)"
        ];

        for (const sql of columns) {
            try {
                await db.query(sql);
                console.log(`Executed: ${sql}`);
            } catch (e) {
                console.log(`Skipped (likely exists): ${sql}`);
            }
        }

        // Logic to generate unique shelter_slugs for existing shelters
        const shelters = await db.query("SELECT id, shelter_name FROM users WHERE role = 'shelter' AND shelter_slug IS NULL");
        for (let i = 0; i < shelters.rows.length; i++) {
            const shelter = shelters.rows[i];
            const baseSlug = (shelter.shelter_name || `shelter-${shelter.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
            const slug = `${baseSlug}-${shelter.id}`;
            await db.query("UPDATE users SET shelter_slug = ? WHERE id = ?", [slug, shelter.id]);
            console.log(`Assigned slug ${slug} to shelter ID ${shelter.id}`);
        }

        console.log('Shelter profile schema updated successfully with slugs');
        process.exit(0);
    } catch (error) {
        console.error('Error updating shelter schema:', error);
        process.exit(1);
    }
}

updateShelterSchema();
