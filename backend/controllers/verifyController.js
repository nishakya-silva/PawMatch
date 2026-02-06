const db = require('../config/db');

exports.verifyIdentity = async (req, res) => {
    try {
        const { userId, documentId, type } = req.body;

        // Mock Verification Logic
        // In real world, call reliable 3rd party API (Stripe Identity, Onfido, etc.)

        console.log(`Verifying User ${userId} with doc ${documentId}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const isSuccess = true; // Always succeed for demo

        if (isSuccess) {
            await db.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [userId]);

            return res.json({
                success: true,
                status: "verified",
                message: "Identity successfully verified"
            });
        } else {
            return res.status(400).json({
                success: false,
                status: "rejected",
                message: "Verification failed"
            });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
