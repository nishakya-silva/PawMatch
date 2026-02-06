const db = require('./config/db');

async function updateSchemaForAchievements() {
    try {
        console.log('Updating database schema for achievements...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS user_achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                achievement_type VARCHAR(50) NOT NULL,
                related_data JSON,
                achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_achievement (user_id, achievement_type)
            )
        `;

        await db.query(createTableQuery);
        console.log('Created table: user_achievements');

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error updating schema:', error);
        process.exit(1);
    }
}

updateSchemaForAchievements();
