const db = require('./config/db');

async function checkSchema() {
    const tables = ['adoptions', 'pets', 'users'];
    for (const table of tables) {
        console.log(`\n--- Schema for ${table} ---`);
        const res = await db.query(`DESCRIBE ${table}`);
        res.rows.forEach(r => {
            console.log(`${r.Field}: ${r.Type} (${r.Null})`);
        });
    }
}

checkSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
