const fs = require('fs');
const path = require('path');

const mappingFile = path.join(__dirname, 'image_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

const rootDir = path.join(__dirname, '../');
const targetDirs = ['app', 'components'];

const extensions = ['.tsx', '.ts', '.js', '.jsx', '.css'];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
                walk(dirPath, callback);
            }
        } else {
            if (extensions.includes(path.extname(dirPath))) {
                callback(dirPath);
            }
        }
    });
}

console.log('Replacing local image paths with Cloudinary URLs in frontend code...');

let replaceCount = 0;

targetDirs.forEach(targetDir => {
    const fullTargetDir = path.join(rootDir, targetDir);
    if (fs.existsSync(fullTargetDir)) {
        walk(fullTargetDir, (filePath) => {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            Object.entries(mapping).forEach(([localName, cloudUrl]) => {
                // Replace "/localPath" or "localPath"
                // Match patterns like src="/image.jpg", src='image.jpg', url(/image.jpg)

                // 1. Literal /filename
                const regex1 = new RegExp(`"/${localName}"`, 'g');
                content = content.replace(regex1, `"${cloudUrl}"`);

                const regex2 = new RegExp(`'/${localName}'`, 'g');
                content = content.replace(regex2, `'${cloudUrl}'`);

                // 2. Literal filename (without leading slash) if it's in a string
                const regex3 = new RegExp(`"${localName}"`, 'g');
                content = content.replace(regex3, `"${cloudUrl}"`);

                const regex4 = new RegExp(`'${localName}'`, 'g');
                content = content.replace(regex4, `'${cloudUrl}'`);
            });

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                console.log(`Updated: ${path.relative(rootDir, filePath)}`);
                replaceCount++;
            }
        });
    }
});

console.log(`\nFinished. Updated ${replaceCount} files.`);
process.exit(0);
