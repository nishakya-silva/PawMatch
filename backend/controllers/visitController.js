const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.scheduleVisit = async (req, res) => {
    try {
        const { petId, userId, date, time, notes } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required. Please log in." });
        }
        if (!petId) {
            return res.status(400).json({ error: "Pet ID is required" });
        }
        if (!date || !time) {
            return res.status(400).json({ error: "Date and Time are required" });
        }

        const result = await db.query(
            "SELECT shelter_id FROM pets WHERE id = ?",
            [petId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pet not found" });
        }
        const shelterId = result.rows[0].shelter_id;

        const visitResult = await db.query(
            "INSERT INTO shelter_visits (user_id, pet_id, shelter_id, visit_date, visit_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, 'scheduled')",
            [userId, petId, shelterId, date, time, notes || null]
        );

        // Log activity
        await logActivity(userId, 'VISIT_SCHEDULED', { petId, visitId: visitResult.rows.insertId, date, time, shelterId });

        res.json({
            success: true,
            message: "Visit scheduled! The shelter has been notified.",
            visitId: visitResult.rows.insertId
        });

    } catch (error) {
        console.error("Schedule Visit Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getUserVisits = async (req, res) => {
    try {
        const userId = req.user.id;
        const visits = await db.query(
            "SELECT v.*, p.name as pet_name FROM shelter_visits v JOIN pets p ON v.pet_id = p.id WHERE v.user_id = ? ORDER BY visit_date ASC",
            [userId]
        );
        res.json({ success: true, visits: visits.rows });
    } catch (error) {
        console.error("Get User Visits Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.updateVisit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { date, time, notes } = req.body;

        const result = await db.query(
            "UPDATE shelter_visits SET visit_date = ?, visit_time = ?, notes = ? WHERE id = ? AND user_id = ?",
            [date, time, notes, id, userId]
        );

        if (result.rows.affectedRows === 0) {
            return res.status(404).json({ error: "Visit not found or unauthorized" });
        }

        res.json({ success: true, message: "Visit updated successfully" });
    } catch (error) {
        console.error("Update Visit Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.cancelVisit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM shelter_visits WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        if (result.rows.affectedRows === 0) {
            return res.status(404).json({ error: "Visit not found or unauthorized" });
        }

        res.json({ success: true, message: "Visit cancelled successfully" });
    } catch (error) {
        console.error("Cancel Visit Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
