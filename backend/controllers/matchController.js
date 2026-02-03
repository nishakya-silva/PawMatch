const matchingService = require('../services/matchingService');
const db = require('../config/db');

exports.getMatches = async (req, res) => {
    try {
        const { answers, userId } = req.body;

        // validate answers exist
        if (!answers) {
            return res.status(400).json({ error: "Assessment answers are required" });
        }

        // Run matching algorithm
        const matches = await matchingService.findMatches(answers);

        // If user is authenticated, save their pawsonality profile
        if (userId) {
            await db.query(
                "UPDATE users SET pawsonality_results = ? WHERE id = ?",
                [JSON.stringify(answers), userId]
            );
        }

        res.json({
            success: true,
            count: matches.length,
            matches
        });

    } catch (error) {
        console.error("Match error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
