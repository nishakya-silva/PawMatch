const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        const { adoptionId } = req.params;

        // 1. Get Adoption & Pet Details
        const adoptionRes = await db.query(`
      SELECT a.*, p.name as pet_name, p.image_url 
      FROM adoptions a 
      JOIN pets p ON a.pet_id = p.id 
      WHERE a.id = ?
    `, [adoptionId]);

        if (adoptionRes.rows.length === 0) {
            return res.status(404).json({ error: "Adoption record not found" });
        }

        const adoption = adoptionRes.rows[0];

        // 2. Calculate Dates/Progress
        const today = new Date();
        const adoptionDate = new Date(adoption.adoption_date);
        const diffTime = Math.abs(today - adoptionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 3. Get Logs
        const logsRes = await db.query(`
      SELECT * FROM welfare_logs 
      WHERE adoption_id = ? 
      ORDER BY log_date DESC 
      LIMIT 14
    `, [adoptionId]);

        // 4. Calculate Streak
        // Simple logic: consecutive days with logs
        let streak = 0;
        // (Implementation of streak logic would iterate logs)

        // 5. 3-3-3 Logic
        // Days 1-3: Decompression
        // Days 4-21: Learning
        // Days 22-90: Bonding

        let currentPhase = 1;
        if (diffDays > 3) currentPhase = 2;
        if (diffDays > 21) currentPhase = 3;

        const dashboardData = {
            petName: adoption.pet_name,
            petImage: adoption.image_url,
            adoptionDate: adoption.adoption_date,
            currentDay: diffDays,
            totalDays: 14, // Tracker period
            overallProgress: Math.min(100, (diffDays / 14) * 100),
            streak: logsRes.rows.length, // Simplified
            logs: logsRes.rows,
            phaseInfo: {
                current: currentPhase,
                day: diffDays
            }
        };

        res.json(dashboardData);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.postLog = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const { checklist, mood, notes } = req.body;

        // Insert Log
        await db.query(`
      INSERT INTO welfare_logs (adoption_id, checklist, mood, notes)
      VALUES (?, ?, ?, ?)
    `, [adoptionId, JSON.stringify(checklist), mood, notes]);

        // Check for Risks (Sentinel)
        // If mood is 'anxious' for last 3 entries
        const recentLogs = await db.query(`
      SELECT mood FROM welfare_logs 
      WHERE adoption_id = ? 
      ORDER BY created_at DESC 
      LIMIT 3
    `, [adoptionId]);

        const moods = recentLogs.rows.map(r => r.mood);
        if (moods.length === 3 && moods.every(m => m === 'anxious')) {
            // Trigger Alert
            // TODO: Call Alert Service
            console.log("RISK DETECTED: 3 days of anxiety");
        }

        res.json({ success: true, message: "Log saved" });

    } catch (error) {
        console.error("Log Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
