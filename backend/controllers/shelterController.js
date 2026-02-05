const db = require('../config/db');

/**
 * Gets all incoming visit requests for a specific shelter.
 * This can be used in the Shelter Dashboard.
 */
exports.getVisitRequests = async (req, res) => {
    try {
        const { shelterId } = req.params;

        if (!shelterId) {
            return res.status(400).json({ error: "Shelter ID is required" });
        }

        const query = `
            SELECT 
                v.id as visit_id,
                v.visit_date,
                v.visit_time,
                v.status,
                v.notes,
                u.name as user_name,
                u.email as user_email,
                u.phone_number as user_phone,
                p.name as pet_name,
                p.image_url as pet_image
            FROM shelter_visits v
            JOIN users u ON v.user_id = u.id
            JOIN pets p ON v.pet_id = p.id
            WHERE v.shelter_id = ?
            ORDER BY v.visit_date ASC, v.visit_time ASC
        `;

        const visits = await db.query(query, [shelterId]);

        res.json({
            success: true,
            count: visits.rows.length,
            requests: visits.rows
        });

    } catch (error) {
        console.error("Shelter Visit Request Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Updates the status of a visit request (e.g., approved, completed, cancelled).
 */
exports.updateVisitStatus = async (req, res) => {
    try {
        const { visitId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        await db.query(
            "UPDATE shelter_visits SET status = ? WHERE id = ?",
            [status, visitId]
        );

        res.json({
            success: true,
            message: `Visit request status updated to ${status}`
        });

    } catch (error) {
        console.error("Update Visit Status Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
