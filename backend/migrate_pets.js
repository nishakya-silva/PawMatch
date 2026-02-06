const mysql = require('mysql2/promise');

async function expandPetsSchema() {
    console.log('Connecting to database...');
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rash@20031219mi',
            database: 'pawmatch'
        });
        console.log('Connected successfully!');

        const [columns] = await connection.query('SHOW COLUMNS FROM pets');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns in pets:', columnNames);

        const tryAdd = async (col, type) => {
            if (!columnNames.includes(col)) {
                await connection.query(`ALTER TABLE pets ADD COLUMN ${col} ${type}`);
                console.log(`Added ${col} column`);
            } else {
                console.log(`${col} already exists`);
            }
        };

        await tryAdd('weight', 'VARCHAR(50)');
        await tryAdd('is_vaccinated', 'BOOLEAN DEFAULT FALSE');
        await tryAdd('is_neutered', 'BOOLEAN DEFAULT FALSE');
        await tryAdd('is_microchipped', 'BOOLEAN DEFAULT FALSE');
        await tryAdd('is_health_checked', 'BOOLEAN DEFAULT FALSE');
        await tryAdd('is_foster', 'BOOLEAN DEFAULT FALSE');

        console.log('Schema update for pets complete.');
    } catch (error) {
        console.error('Failed to update schema:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

expandPetsSchema();
