const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS shelter_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                pet_id INT,
                visit_date DATE NOT NULL,
                visit_time TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (pet_id) REFERENCES pets(id)
            );
        `);
        console.log('Created shelter_visits table.');

        await connection.end();
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
        if (connection) await connection.end();
    }
}

migrate();
