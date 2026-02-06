const db = require('./config/db');
const fs = require('fs');

async function getSchema() {
    try {
        const [adoptions] = await db.pool.query('DESCRIBE adoptions');
        const [pets] = await db.pool.query('DESCRIBE pets');
        const [users] = await db.pool.query('DESCRIBE users');

        const schema = {
            adoptions,
            pets,
            users
        };

        fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log('Schema dumped to schema_dump.json');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

getSchema();
