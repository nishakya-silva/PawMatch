const db = require('./config/db');

async function stats() {
    try {
        const res = await db.query('SELECT image_url FROM pets');
        const total = res.rows.length;
        const cloud = res.rows.filter(p => p.image_url && p.image_url.includes('cloudinary.com')).length;
        console.log(`Total: ${total}`);
        console.log(`Cloudinary: ${cloud}`);

        const nonCloud = res.rows.filter(p => p.image_url && !p.image_url.includes('cloudinary.com'));
        if (nonCloud.length > 0) {
            console.log('\nNon-Cloudinary URLs:');
            nonCloud.forEach(p => console.log(`- ${p.image_url}`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
stats();
