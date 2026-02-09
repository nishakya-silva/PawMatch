const db = require('../config/db');
const { logActivity } = require('../utils/logger');
const { checkAndAwardAchievements } = require('../services/achievementService');

exports.applyForAdoption = async (req, res) => {
    try {
        const { petId, answers } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required. Please log in." });
        }
        if (!petId) {
            return res.status(400).json({ error: "Pet ID is required" });
        }

        const connection = await db.pool.getConnection();
        try {
            await connection.query("START TRANSACTION");

            // 1. Check if already applied
            const [existing] = await connection.query(
                "SELECT id FROM adoptions WHERE user_id = ? AND pet_id = ? AND status IN ('pending', 'approved', 'active')",
                [userId, petId]
            );

            if (existing.length > 0) {
                await connection.release();
                return res.status(400).json({ error: "You have already applied for this pet." });
            }

            // 2. Insert as 'pending'
            const [results] = await connection.query(
                "INSERT INTO adoptions (user_id, pet_id, status) VALUES (?, ?, 'pending')",
                [userId, petId]
            );

            // Note: We DO NOT update pet status to 'adopted' yet. It remains 'available' until approved.

            await connection.commit();

            await logActivity(userId, 'ADOPTION_APPLICATION', { petId, adoptionId: results.insertId });

            // Achievements might be awarded for applying
            const newAchievements = await checkAndAwardAchievements(userId);

            res.json({
                success: true,
                message: "Application submitted successfully! The shelter will review your profile.",
                adoptionId: results.insertId,
                achievements: newAchievements
            });
        } catch (sqlError) {
            await connection.rollback();
            console.error("SQL Error in Transaction:", sqlError);
            if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(404).json({ error: "User or Pet not found." });
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
        const userId = req.user.id;
        const query = `
            SELECT a.*, p.name as petName, p.image_url as petImage, p.breed, p.status as petStatus, p.age, p.gender
            FROM adoptions a
            JOIN pets p ON a.pet_id = p.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
        `;
        const adoptions = await db.query(query, [userId]);
        res.json({ success: true, adoptions: adoptions.rows });
    } catch (error) {
        console.error("Get User Adoptions Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getShelterApplications = async (req, res) => {
    try {
        const userId = req.user.id; // This is the shelter user ID

        // LIMITATION: We assume the user ID IS the shelter ID in the pets table if using simplified model,
        // OR we check the users table for shelter_id. 
        // Based on previous code, shelter_id in pets table matches users.id for shelter users.

        const query = `
            SELECT a.id as adoption_id, a.status, a.adoption_date, a.created_at,
                   u.name as user_name, u.email as user_email, u.phone_number as user_phone, u.pawsonality_results,
                   p.name as pet_name, p.image_url as pet_image, p.id as pet_id
            FROM adoptions a
            JOIN users u ON a.user_id = u.id
            JOIN pets p ON a.pet_id = p.id
            WHERE p.shelter_id = ? AND a.status = 'pending'
            ORDER BY a.created_at DESC
        `;

        const applications = await db.query(query, [userId]);
        res.json({ success: true, applications: applications.rows });

    } catch (error) {
        console.error("Get Shelter Applications Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.approveAdoption = async (req, res) => {
    try {
        const { adoptionId } = req.body;
        const shelterId = req.user.id;

        if (!adoptionId) return res.status(400).json({ error: "Adoption ID required" });

        const connection = await db.pool.getConnection();
        try {
            await connection.query("START TRANSACTION");

            // Verify ownership
            const [check] = await connection.query(`
                SELECT a.id, a.pet_id 
                FROM adoptions a 
                JOIN pets p ON a.pet_id = p.id 
                WHERE a.id = ? AND p.shelter_id = ?
            `, [adoptionId, shelterId]);

            if (check.length === 0) {
                await connection.release();
                return res.status(403).json({ error: "Application not found or unauthorized" });
            }

            const petId = check[0].pet_id;

            // Update Adoption Status
            await connection.query(
                "UPDATE adoptions SET status = 'active', is_status_read = 0 WHERE id = ?",
                [adoptionId]
            );

            // Update Pet Status
            await connection.query(
                "UPDATE pets SET status = 'adopted' WHERE id = ?",
                [petId]
            );

            // Optionally: Reject other pending applications for this pet?
            // For now, let's leave them or user can manually handle.

            await connection.commit();
            res.json({ success: true, message: "Adoption approved! Process started." });

        } catch (sqlError) {
            await connection.rollback();
            throw sqlError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Approve Adoption Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

