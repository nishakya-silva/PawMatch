const db = require('./config/db');
const cloudinary = require('cloudinary').v2;
const path = require('path');

async function fixRemaining() {
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const res = await db.query('SELECT id, image_url FROM pets');
        const remaining = res.rows.filter(p => p.image_url && !p.image_url.includes('cloudinary.com'));

        console.log(`Fixing ${remaining.length} remaining pets...`);

        for (const pet of remaining) {
            try {
                console.log(`Uploading for Pet ${pet.id}: ${pet.image_url}`);
                // Use a very basic upload
                const result = await cloudinary.uploader.upload(pet.image_url, {
                    folder: 'pawmatch/pets_final'
                });
                await db.query('UPDATE pets SET image_url = ? WHERE id = ?', [result.secure_url, pet.id]);
                console.log(`Success Pet ${pet.id} -> ${result.secure_url}`);
            } catch (err) {
                console.error(`Error Pet ${pet.id}:`, err.message);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixRemaining();
