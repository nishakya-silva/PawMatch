const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicDir = path.join(__dirname, '../public');
const mappingFile = path.join(__dirname, 'image_mapping.json');

async function uploadImages() {
    console.log('Starting upload of public images to Cloudinary...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    const files = fs.readdirSync(publicDir);
    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'));

    const mapping = {};

    for (const file of imageFiles) {
        try {
            const filePath = path.join(publicDir, file);
            console.log(`Uploading ${file}...`);
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'pawmatch/static',
            });
            mapping[file] = result.secure_url;
            console.log(`Uploaded ${file} -> ${result.secure_url}`);
        } catch (error) {
            console.error(`Failed to upload ${file}:`, error.message);
        }
    }

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\nUpload complete. Mapping saved to ${mappingFile}`);
    process.exit(0);
}

uploadImages();
