const db = require('./config/db');

async function createFosterTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS foster_assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pet_id INT NOT NULL,
                user_id INT NOT NULL,
                shelter_id INT NOT NULL,
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                outcome ENUM('adopted_by_foster', 'adopted_by_other', 'returned_to_shelter', 'deceased') DEFAULT NULL,
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME DEFAULT NULL,
                notes TEXT,
                FOREIGN KEY (pet_id) REFERENCES pets(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (shelter_id) REFERENCES users(id)
            )
        `);
        console.log('foster_assignments table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

createFosterTable();
