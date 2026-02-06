const db = require('./config/db');

async function getPets() {
    try {
        const result = await db.query('SELECT id, name, image_url FROM pets');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
getPets();
