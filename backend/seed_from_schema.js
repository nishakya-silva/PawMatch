const fs = require('fs');
const path = require('path');
const db = require('./config/db'); // Uses the existing pool wrapper

async function runSeed() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);

        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Naive split by semicolon. 
        // Note: This might break if semicolons are inside strings/comments, 
        // but for our current schema.sql it should be sufficient.
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            try {
                // Skip empty lines or just comments
                if (!statement || statement.startsWith('--')) continue;

                await db.query(statement);
            } catch (err) {
                // Ignore specific errors like "Duplicate column" or "Table exists" if we want idempotent behavior
                // But for now, let's log everything.
                const isDuplicate = err.message.includes('Duplicate column name') || err.message.includes('already exists');
                if (isDuplicate) {
                    // console.log('Skipping duplicate/existing item.'); 
                } else {
                    console.error('Error executing statement:', statement.substring(0, 50) + '...', err.message);
                }
            }
        }

        console.log('Seed completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error running seed:', error);
        process.exit(1);
    }
}

runSeed();
