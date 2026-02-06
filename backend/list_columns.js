const mysql = require('mysql2/promise');

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rash@20031219mi',
            database: 'pawmatch'
        });
        const [columns] = await connection.query('SHOW COLUMNS FROM pets');
        const names = columns.map(c => c.Field);
        console.log('Columns in pets table:', names.join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
check();
