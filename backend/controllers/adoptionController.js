const db = require('../config/db');

exports.applyForAdoption = async (req, res) => {
    try {
        const { petId, userId, answers } = req.body;

        // Create adoption record
        const result = await db.query(
            "INSERT INTO adoptions (user_id, pet_id, status) VALUES (?, ?, 'pending')",
            [userId || 1, petId] // Default user 1
        );

        // MySQL returns { affectedRows: 1, insertId: 123, ... } in the first element of execute result
        // My wrapper returns { rows: [ResultSetHeader] } for execute
        // But let's check wrapper implementation in db.js:
        // const [results, ] = await pool.execute(sql, params);
        // return { rows: results };
        // For INSERT, results is a Header object with insertId.

        res.json({
            success: true,
            message: "Application submitted successfully",
            adoptionId: result.rows.insertId
        });

    } catch (error) {
        console.error("Adoption Application Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
