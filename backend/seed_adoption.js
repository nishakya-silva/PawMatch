const db = require('./config/db');

async function seedAdoption() {
    try {
        console.log('Checking for adoptions...');

        // Check users
        const users = await db.query('SELECT id FROM users LIMIT 1');
        let userId = users.rows.length > 0 ? users.rows[0].id : null;

        // Check pets
        const pets = await db.query('SELECT id FROM pets LIMIT 1');
        let petId = pets.rows.length > 0 ? pets.rows[0].id : null;

        if (!userId || !petId) {
            console.log('Cannot seed adoption: Need at least 1 user and 1 pet in DB.');
            // Try to seed pet if missing?
            if (!petId) {
                console.log('Seeding dummy pet...');
                const res = await db.query(`INSERT INTO pets (name, type, breed, age, gender, status, image_url) VALUES ('Demo Dog', 'Dog', 'Mongrel', '2 years', 'Male', 'available', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1')`);
                petId = res.rows.insertId;
                console.log('Seeded Pet ID:', petId);
            }
            if (!userId) {
                // We assume user exists from previous steps, but just in case
                console.log('No users found. Please register a user first via the app.');
                process.exit(1);
            }
        }

        // Check adoption with ID 1
        const check = await db.query('SELECT * FROM adoptions WHERE id = 1');
        if (check.rows.length === 0) {
            console.log('No adoption with ID 1 found. Creating dummy adoption...');
            await db.query(`INSERT INTO adoptions (id, user_id, pet_id, status, adoption_date) VALUES (1, ?, ?, 'approved', NOW())`, [userId, petId]);
            console.log('Created Adoption ID 1');
        } else {
            console.log('Adoption ID 1 already exists.');
        }

        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
}

seedAdoption();
