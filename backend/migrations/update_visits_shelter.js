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
            ALTER TABLE shelter_visits 
            ADD COLUMN shelter_id INT,
            ADD FOREIGN KEY (shelter_id) REFERENCES users(id); -- Assuming shelters are users with a specific role, or just an ID
        `);
        console.log('Added shelter_id to shelter_visits.');

        await connection.end();
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
        if (connection) await connection.end();
    }
}

migrate();
