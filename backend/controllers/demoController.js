const db = require('../config/db');

exports.requestDemo = async (req, res) => {
    try {
        const { name, email, shelterName, message } = req.body;

        if (!name || !email || !shelterName) {
            return res.status(400).json({ error: "Please provide name, email, and shelter name." });
        }

        await db.query(`
            INSERT INTO demo_requests (name, email, shelter_name, message)
            VALUES (?, ?, ?, ?)
        `, [name, email, shelterName, message]);

        res.json({ success: true, message: "Request submitted successfully! Our team will contact you soon." });

    } catch (error) {
        console.error("Demo Request Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getDemoRequests = async (req, res) => {
    try {
        const requests = await db.query('SELECT * FROM demo_requests ORDER BY created_at DESC');
        res.json(requests.rows || requests);
    } catch (error) {
        console.error("Get Demo Requests Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
