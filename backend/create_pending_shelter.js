const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createPendingShelter() {
    try {
        const email = 'shelter_pending@pawmatch.com';
        const password = 'password123';
        const name = 'Pending Shelter Manager';
        const role = 'shelter';
        const shelter_name = 'Pending Review Shelter';

        // Check if exists
        const check = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (check.rows.length > 0) {
            console.log("Pending shelter user already exists.");
            // Reset status to pending for testing
            await db.query("UPDATE users SET verification_status = 'pending', registry_type = 'NGO Secretariat', registration_number = 'L-99999' WHERE email = ?", [email]);
            console.log("Reset status to pending.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            "INSERT INTO users (name, email, password_hash, role, shelter_name, is_verified, verification_status, registry_type, registration_number) VALUES (?, ?, ?, ?, ?, true, 'pending', 'NGO Secretariat', 'L-99999')",
            [name, email, hashedPassword, role, shelter_name]
        );

        console.log(`Pending shelter created.\nEmail: ${email}\nPassword: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating pending shelter:", error);
        process.exit(1);
    }
}

createPendingShelter();
