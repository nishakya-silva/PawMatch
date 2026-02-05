const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user.id;

        // 1. Get Adoption & Pet Details - Verify ownership
        const adoptionRes = await db.query(`
            SELECT a.*, p.name as pet_name, p.image_url 
            FROM adoptions a 
            JOIN pets p ON a.pet_id = p.id 
            WHERE a.id = ? AND a.user_id = ?
        `, [adoptionId, userId]);

        const adoptionArr = adoptionRes.rows || adoptionRes;
        if (adoptionArr.length === 0) {
            return res.status(404).json({ error: "Adoption record not found or access denied" });
        }

        const adoption = adoptionArr[0];

        // 2. Calculate Dates/Progress
        const today = new Date();
        const adoptionDate = new Date(adoption.adoption_date);
        const diffTime = Math.abs(today - adoptionDate);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // Tracker lasts 90 days (3 months)
        const TRACKER_DURATION = 90;
        const isCompleted = diffDays > TRACKER_DURATION;

        // 3. Get Logs
        const logsRes = await db.query(`
            SELECT * FROM welfare_logs 
            WHERE adoption_id = ? 
            ORDER BY log_date DESC 
            LIMIT 30
        `, [adoptionId]);
        const logs = logsRes.rows || logsRes;

        // 4. Calculate Streak
        const streak = logs.filter(log => {
            const logDate = new Date(log.log_date);
            const timeDiff = Math.abs(today - logDate);
            const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return dayDiff <= 7;
        }).length;

        // 5. 3-3-3 Logic
        let currentPhase = 1;
        if (diffDays > 3) currentPhase = 2;
        if (diffDays > 21) currentPhase = 3;

        const dashboardData = {
            petName: adoption.pet_name,
            petImage: adoption.image_url,
            adoptionDate: adoption.adoption_date,
            currentDay: diffDays,
            totalDays: TRACKER_DURATION,
            overallProgress: Math.min(100, Math.round((diffDays / TRACKER_DURATION) * 100)),
            streak: streak,
            logs: logs,
            isCompleted: isCompleted,
            phaseInfo: {
                current: currentPhase,
                phaseName: currentPhase === 1 ? "Decompression" : currentPhase === 2 ? "Learning & Routine" : "Bonding & Confidence",
                daysInPhase: currentPhase === 1 ? 3 : currentPhase === 2 ? 21 : 90,
                progressInPhase: currentPhase === 1
                    ? Math.round((diffDays / 3) * 100)
                    : currentPhase === 2
                        ? Math.round(((diffDays - 3) / 18) * 100)
                        : Math.round(((diffDays - 21) / 69) * 100)
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
        const userId = req.user.id;

        // Verify Ownership
        const adoptionRes = await db.query('SELECT user_id FROM adoptions WHERE id = ?', [adoptionId]);
        const adoption = (adoptionRes.rows || adoptionRes)[0];

        if (!adoption || adoption.user_id !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Insert Log
        await db.query(`
            INSERT INTO welfare_logs (adoption_id, checklist, mood, notes)
            VALUES (?, ?, ?, ?)
        `, [adoptionId, JSON.stringify(checklist), mood, notes]);

        // Risk detection logic...
        const recentLogsRes = await db.query(`
            SELECT mood FROM welfare_logs 
            WHERE adoption_id = ? 
            ORDER BY created_at DESC 
            LIMIT 3
        `, [adoptionId]);

        const logs = recentLogsRes.rows || recentLogsRes;
        const moods = logs.map(r => r.mood);
        if (moods.length === 3 && moods.every(m => m === 'anxious')) {
            await db.query('UPDATE welfare_logs SET risk_flagged = TRUE WHERE adoption_id = ? ORDER BY created_at DESC LIMIT 1', [adoptionId]);
            console.log("RISK DETECTED: 3 days of anxiety for adoption", adoptionId);
        }

        res.json({ success: true, message: "Log saved" });

    } catch (error) {
        console.error("Log Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
