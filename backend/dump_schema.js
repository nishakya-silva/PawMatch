const db = require('./config/db');

async function getSchema() {
    try {
        const tablesResult = await db.query('SHOW TABLES');
        // Handle different return structures depending on mysql2 driver version/config
        const rows = tablesResult.rows || tablesResult;
        const tableNames = rows.map(r => Object.values(r)[0]);

        console.log("-- Database Schema Dump\n");

        for (const table of tableNames) {
            const createResult = await db.query(`SHOW CREATE TABLE \`${table}\``);
            const createRows = createResult.rows || createResult;
            console.log(createRows[0]['Create Table'] + ";\n");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getSchema();
