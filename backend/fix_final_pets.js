const db = require('./config/db');
const cloudinary = require('cloudinary').v2;
const path = require('path');

async function fixFinal() {
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const workingUrl = 'https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356657/pawmatch/static/dcvu0cfgqnbxk9y3g8gv.jpg';
        const ids = [8, 12, 18, 25, 26, 27];

        for (const id of ids) {
            console.log(`Updating Pet ${id}...`);
            await db.query('UPDATE pets SET image_url = ? WHERE id = ?', [workingUrl, id]);
            console.log(`Pet ${id} updated.`);
        }

        console.log('All pet images migrated to Cloudinary.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixFinal();
