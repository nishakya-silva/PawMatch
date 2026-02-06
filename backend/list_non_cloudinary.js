const db = require('./config/db');

async function list() {
    try {
        const res = await db.query('SELECT id, name, image_url FROM pets WHERE image_url NOT LIKE "%cloudinary.com%"');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
list();
