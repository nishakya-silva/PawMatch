const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const mappingFile = path.join(__dirname, 'image_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

async function updateDatabase() {
    try {
        console.log('Updating database pet images to Cloudinary...');

        const result = await db.query('SELECT id, image_url FROM pets');
        const pets = result.rows;

        let updateCount = 0;

        for (const pet of pets) {
            if (!pet.image_url) continue;

            // Check if existing URL ends with any of our mapped filenames
            let matchedFilename = null;
            for (const filename of Object.keys(mapping)) {
                if (pet.image_url.endsWith(filename)) {
                    matchedFilename = filename;
                    break;
                }
            }

            if (matchedFilename) {
                const cloudUrl = mapping[matchedFilename];
                console.log(`Updating Pet ID ${pet.id}: ${pet.image_url} -> ${cloudUrl}`);
                await db.query('UPDATE pets SET image_url = ? WHERE id = ?', [cloudUrl, pet.id]);
                updateCount++;
            }
        }

        console.log(`\nUpdated ${updateCount} pets in the database.`);
        process.exit(0);
    } catch (e) {
        console.error('Database update failed:', e);
        process.exit(1);
    }
}

updateDatabase();
