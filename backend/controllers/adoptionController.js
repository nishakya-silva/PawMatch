const db = require('../config/db');

exports.applyForAdoption = async (req, res) => {
    try {
        const { petId, userId, answers } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required. Please log in." });
        }
        if (!petId) {
            return res.status(400).json({ error: "Pet ID is required" });
        }

        // Create adoption record
        try {
            const result = await db.query(
                "INSERT INTO adoptions (user_id, pet_id, status) VALUES (?, ?, 'pending')",
                [userId, petId] // Removed unsafe default || 1
            );

            res.json({
                success: true,
                message: "Application submitted successfully",
                adoptionId: result.rows.insertId
            });
        } catch (sqlError) {
            // Handle Foreign Key Constraint Failure
            if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
                if (sqlError.sqlMessage && sqlError.sqlMessage.includes('user_id')) {
                    return res.status(404).json({ error: "User account not found. Please log in again." });
                }
                if (sqlError.sqlMessage && sqlError.sqlMessage.includes('pet_id')) {
                    return res.status(404).json({ error: "Pet not found." });
                }
                return res.status(400).json({ error: "Referenced record (User or Pet) not found." });
            }
            // Re-throw if it's not a foreign key error
            throw sqlError;
        }

    } catch (error) {
        console.error("Adoption Application Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
