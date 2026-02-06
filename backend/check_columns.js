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
        console.log(JSON.stringify(columns, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
check();
