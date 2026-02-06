const mysql = require('mysql2/promise');

async function migrate() {
    console.log('Starting final pet schema migration...');
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rash@20031219mi',
            database: 'pawmatch'
        });

        // 1. Ensure pets table has all new columns with correct types
        const [columns] = await connection.query('SHOW COLUMNS FROM pets');
        const columnNames = columns.map(c => c.Field);

        const columnsToAdd = [
            { name: 'weight', type: 'VARCHAR(50)' },
            { name: 'is_vaccinated', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'is_neutered', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'is_microchipped', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'is_health_checked', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'is_foster', type: 'BOOLEAN DEFAULT FALSE' }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name)) {
                await connection.query(`ALTER TABLE pets ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added column: ${col.name}`);
            }
        }

        // 2. Clear existing pets to avoid ID fragmentation/conflicts during demo (Optional but cleaner for "it should show up")
        // await connection.query('DELETE FROM adoptions'); // Clear dependencies first
        // await connection.query('DELETE FROM pets');
        // console.log('Cleared existing pets for fresh start');

        // 3. Ensure shelter_id 1 exists if referenced as fallback
        const [shelterCheck] = await connection.query('SELECT * FROM users WHERE id = 1');
        if (shelterCheck.length === 0) {
            console.log('Warning: shelter_id 1 not found. In a real app, ensure you are logged in.');
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

migrate();
