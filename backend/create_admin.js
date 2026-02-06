const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const email = 'admin@pawmatch.com';
        const password = 'admin123';
        const name = 'Super Admin';
        const role = 'admin';

        // Check if exists
        const check = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (check.rows.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, true)",
            [name, email, hashedPassword, role]
        );

        console.log(`Admin user created successfully.\nEmail: ${email}\nPassword: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();
