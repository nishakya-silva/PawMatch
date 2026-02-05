const db = require('../config/db');

exports.sendMessage = async (req, res) => {
    try {
        const { adoptionId, subject, message } = req.body;
        const userId = req.user.id;

        // 1. Get Shelter ID and Pet ID from the adoption record
        const adoptionRes = await db.query(`
            SELECT a.id, a.pet_id, p.shelter_id 
            FROM adoptions a 
            JOIN pets p ON a.pet_id = p.id 
            WHERE a.id = ? AND a.user_id = ?
        `, [adoptionId, userId]);

        const adoptionArr = adoptionRes.rows || adoptionRes;
        if (adoptionArr.length === 0) {
            return res.status(404).json({ error: "Adoption record not found" });
        }

        const { shelter_id, pet_id } = adoptionArr[0];

        // 2. Insert Message
        await db.query(`
            INSERT INTO shelter_messages (user_id, adoption_id, pet_id, shelter_id, subject, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, adoptionId, pet_id, shelter_id, subject, message]);

        res.json({ success: true, message: "Message sent to shelter" });

    } catch (error) {
        console.error("Value Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getShelterMessages = async (req, res) => {
    try {
        // This would be for the shelter dashboard
        const resMsg = await db.query(`
            SELECT m.*, u.name as user_name, p.name as pet_name, p.image_url as pet_image
            FROM shelter_messages m 
            JOIN users u ON m.user_id = u.id 
            JOIN adoptions a ON m.adoption_id = a.id 
            JOIN pets p ON a.pet_id = p.id 
            ORDER BY m.created_at DESC
        `);
        res.json({ success: true, messages: resMsg.rows || resMsg });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getVisitRequests = async (req, res) => {
    try {
        const { shelterId } = req.params;
        const visits = await db.query(`
            SELECT v.*, u.name as user_name, u.email as user_email, p.name as pet_name 
            FROM shelter_visits v 
            JOIN users u ON v.user_id = u.id 
            JOIN pets p ON v.pet_id = p.id 
            WHERE v.shelter_id = ? 
            ORDER BY v.visit_date ASC
        `, [shelterId]);
        res.json({ success: true, visits: visits.rows || visits });
    } catch (error) {
        console.error("Get Visit Requests Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.updateVisitStatus = async (req, res) => {
    try {
        const { visitId } = req.params;
        const { status } = req.body;
        await db.query("UPDATE shelter_visits SET status = ? WHERE id = ?", [status, visitId]);
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
