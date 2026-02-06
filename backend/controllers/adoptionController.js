const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.applyForAdoption = async (req, res) => {
    try {
        const { petId, answers } = req.body;
        const userId = req.user.id; // Corrected to use authenticated user

        if (!userId) {
            return res.status(400).json({ error: "User ID is required. Please log in." });
        }
        if (!petId) {
            return res.status(400).json({ error: "Pet ID is required" });
        }

        // Create adoption record and update pet status
        const connection = await db.pool.getConnection();
        try {
            // Start transaction
            await connection.query("START TRANSACTION");

            const [results] = await connection.query(
                "INSERT INTO adoptions (user_id, pet_id, status) VALUES (?, ?, 'approved')",
                [userId, petId]
            );

            await connection.query(
                "UPDATE pets SET status = 'adopted' WHERE id = ?",
                [petId]
            );

            await connection.commit();

            // Log activity
            await logActivity(userId, 'ADOPTION_APPLICATION', { petId, adoptionId: results.insertId });

            res.json({
                success: true,
                message: "Adoption successful! The pet is now linked to your profile.",
                adoptionId: results.insertId
            });
        } catch (sqlError) {
            await connection.rollback();
            console.error("SQL Error in Transaction:", sqlError);

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
            throw sqlError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Adoption Application Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getUserAdoptions = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const query = `
            SELECT a.*, p.name as petName, p.image_url as petImage, p.breed, p.status as petStatus, p.age, p.gender
            FROM adoptions a
            JOIN pets p ON a.pet_id = p.id
            WHERE a.user_id = ?
        `;
        const adoptions = await db.query(query, [userId]);
        res.json({ success: true, adoptions: adoptions.rows });
    } catch (error) {
        console.error("Get User Adoptions Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
