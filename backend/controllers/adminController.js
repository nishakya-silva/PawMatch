const db = require('../config/db');
const { upload } = require('../config/cloudinary');

// Re-use the existing upload config but maybe we want a separate folder or setting for docs?
// For now, standard image/pdf upload is fine. Cloudinary supports PDFs.
exports.uploadVerificationDoc = upload.single('document');

exports.submitVerification = async (req, res) => {
    try {
        const { registry_type, registration_number } = req.body;
        const idToUpdate = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "Document is required" });
        }

        const docUrl = req.file.path;

        await db.query(
            "UPDATE users SET registry_type = ?, registration_number = ?, verification_document_url = ?, verification_status = 'pending' WHERE id = ?",
            [registry_type, registration_number, docUrl, idToUpdate]
        );

        res.json({ success: true, message: "Verification submitted successfully", verification_status: 'pending' });

    } catch (error) {
        console.error("Verification Submit Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getPendingShelters = async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, shelter_name, registry_type, registration_number, verification_document_url, created_at FROM users WHERE role = 'shelter' AND verification_status = 'pending'");
        res.json({ success: true, shelters: result.rows });
    } catch (error) {
        console.error("Get Pending Shelters Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.verifyShelter = async (req, res) => {
    try {
        const { shelterId, action, reason } = req.body; // action: 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: "Invalid action" });
        }

        const newStatus = action === 'approve' ? 'verified' : 'rejected';

        await db.query("UPDATE users SET verification_status = ? WHERE id = ?", [newStatus, shelterId]);

        // Send email notification (mock)
        console.log(`Sending email to shelter ${shelterId}: Verification ${newStatus}. Reason: ${reason || 'N/A'}`);

        res.json({ success: true, message: `Shelter ${newStatus}` });

    } catch (error) {
        console.error("Verify Shelter Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getStats = async (req, res) => {
    try {
        // Mock stats for now, or real queries
        const shelterCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'shelter'");
        const verifiedCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'shelter' AND verification_status = 'verified'");
        const adoptionCount = await db.query("SELECT COUNT(*) as count FROM adoptions WHERE status = 'completed'");

        // Active alerts (welfare_logs with risk_flagged = true within last 14 days?)
        // Let's just count total flagged logs for now
        const alertCount = await db.query("SELECT COUNT(*) as count FROM welfare_logs WHERE risk_flagged = TRUE");

        res.json({
            success: true,
            stats: {
                totalShelters: shelterCount.rows[0].count,
                verifiedShelters: verifiedCount.rows[0].count,
                totalAdoptions: adoptionCount.rows[0].count,
                activeAlerts: alertCount.rows[0]?.count || 0
            }
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
