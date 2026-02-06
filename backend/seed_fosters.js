const db = require('./config/db');

async function seedFosters() {
    try {
        // Get some pets and users
        const petsRes = await db.query("SELECT id, shelter_id FROM pets LIMIT 10");
        const usersRes = await db.query("SELECT id FROM users WHERE role = 'adopter' LIMIT 10");

        const pets = petsRes.rows;
        const users = usersRes.rows;

        if (pets.length === 0 || users.length === 0) {
            console.log("Not enough pets or users to seed fosters");
            process.exit(0);
        }

        // Create some active fosters
        for (let i = 0; i < 3; i++) {
            await db.query(
                "INSERT INTO foster_assignments (pet_id, user_id, shelter_id, status) VALUES (?, ?, ?, 'active')",
                [pets[i].id, users[i % users.length].id, pets[i].shelter_id]
            );
        }

        // Create some completed successful fosters
        for (let i = 3; i < 6; i++) {
            await db.query(
                "INSERT INTO foster_assignments (pet_id, user_id, shelter_id, status, outcome, end_date) VALUES (?, ?, ?, 'completed', 'adopted_by_foster', NOW())",
                [pets[i].id, users[i % users.length].id, pets[i].shelter_id]
            );
        }

        // Create one returned foster
        await db.query(
            "INSERT INTO foster_assignments (pet_id, user_id, shelter_id, status, outcome, end_date) VALUES (?, ?, ?, 'completed', 'returned_to_shelter', NOW())",
            [pets[6].id, users[6 % users.length].id, pets[6].shelter_id]
        );

        console.log('Successfully seeded foster assignments');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedFosters();
