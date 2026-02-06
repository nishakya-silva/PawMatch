const db = require('./config/db');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

async function migrateAllToCloudinary() {
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        console.log('Migrating all pet and user assets to Cloudinary...');

        // 1. Pets Table
        const petsResult = await db.query('SELECT id, name, image_url FROM pets');
        const pets = petsResult.rows;

        for (const pet of pets) {
            let url = pet.image_url;
            if (!url) continue;

            // Skip if already Cloudinary
            if (url.includes('cloudinary.com')) continue;

            try {
                let uploadPath = url;

                // If local path starting with /
                if (url.startsWith('/')) {
                    uploadPath = path.join(__dirname, '../public', url);
                    if (!fs.existsSync(uploadPath)) {
                        console.log(`Local file not found for Pet ${pet.id}: ${uploadPath}`);
                        continue;
                    }
                }

                console.log(`Uploading asset for Pet ${pet.id} (${pet.name}): ${url}`);
                const result = await cloudinary.uploader.upload(uploadPath, {
                    folder: 'pawmatch/pets_migrated',
                });

                await db.query('UPDATE pets SET image_url = ? WHERE id = ?', [result.secure_url, pet.id]);
                console.log(`Updated Pet ${pet.id} -> ${result.secure_url}`);
            } catch (err) {
                console.error(`Failed to migrate Pet ${pet.id}:`, err.message);
            }
        }

        // 2. Users Table (Verification Documents)
        const [userCols] = await db.pool.query('SHOW COLUMNS FROM users');
        const hasDocCol = userCols.some(c => c.Field === 'verification_document_url');

        if (hasDocCol) {
            const usersResult = await db.query('SELECT id, name, verification_document_url FROM users WHERE verification_document_url IS NOT NULL');
            const users = usersResult.rows;

            for (const user of users) {
                let url = user.verification_document_url;
                if (!url || url.includes('cloudinary.com')) continue;

                try {
                    console.log(`Uploading doc for User ${user.id} (${user.name}): ${url}`);
                    const result = await cloudinary.uploader.upload(url, {
                        folder: 'pawmatch/verification_docs',
                    });

                    await db.query('UPDATE users SET verification_document_url = ? WHERE id = ?', [result.secure_url, user.id]);
                    console.log(`Updated User ${user.id} doc -> ${result.secure_url}`);
                } catch (err) {
                    console.error(`Failed to migrate User ${user.id} doc:`, err.message);
                }
            }
        } else {
            console.log('Skipping users table: verification_document_url column does not exist.');
        }

        console.log('\nMigration to Cloudinary finished.');
        process.exit(0);
    } catch (e) {
        console.error('Migration script crashed:', e);
        process.exit(1);
    }
}

migrateAllToCloudinary();
