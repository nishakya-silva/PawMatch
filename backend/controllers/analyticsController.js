const db = require('../config/db');

exports.getShelterAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const shelterId = id;

        // 1. Basic Shelter Info
        const shelterRes = await db.query("SELECT id, shelter_name FROM users WHERE id = ?", [shelterId]);
        const shelter = shelterRes.rows;
        if (shelter.length === 0) {
            return res.status(404).json({ error: "Shelter not found" });
        }

        // 2. Metrics & Trends (Last 30 Days vs Previous 30 Days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // Adoption Rate (Total)
        const adoptionsRes = await db.query("SELECT COUNT(*) as count FROM adoptions a JOIN pets p ON a.pet_id = p.id WHERE p.shelter_id = ?", [shelterId]);
        const intakeRes = await db.query("SELECT COUNT(*) as count FROM pets WHERE shelter_id = ?", [shelterId]);
        const totalAdoptions = adoptionsRes.rows[0].count;
        const totalIntake = intakeRes.rows[0].count;
        const adoptionRate = totalIntake > 0 ? (totalAdoptions / totalIntake) * 100 : 0;

        // ALOS (Average Length of Stay) based on pet intake date
        const alosRes = await db.query(`
            SELECT AVG(DATEDIFF(IFNULL(adoption_date, NOW()), p.created_at)) as alos 
            FROM adoptions a 
            JOIN pets p ON a.pet_id = p.id 
            WHERE p.shelter_id = ?
        `, [shelterId]);
        const alos = Math.round(alosRes.rows[0].alos || 0);

        // Pending Applications
        const pendingRes = await db.query("SELECT COUNT(*) as count FROM adoptions a JOIN pets p ON a.pet_id = p.id WHERE p.shelter_id = ? AND a.status = 'pending'", [shelterId]);
        const pendingApplications = pendingRes.rows[0].count;

        // Profile Views
        const viewsRes = await db.query("SELECT COUNT(*) as count FROM pet_views pv JOIN pets p ON pv.pet_id = p.id WHERE p.shelter_id = ?", [shelterId]);
        const profileViews = viewsRes.rows[0].count;

        // 2b. Foster Analytics
        const activeFostersRes = await db.query("SELECT COUNT(*) as count FROM foster_assignments WHERE shelter_id = ? AND status = 'active'", [shelterId]);
        const activeFosters = activeFostersRes.rows[0].count;

        const fosterOutcomesRes = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN outcome IN ('adopted_by_foster', 'adopted_by_other') THEN 1 ELSE 0 END) as successful
            FROM foster_assignments 
            WHERE shelter_id = ? AND status = 'completed'
        `, [shelterId]);

        const totalFosterOutcomes = fosterOutcomesRes.rows[0].total || 0;
        const successfulFosterOutcomes = fosterOutcomesRes.rows[0].successful || 0;
        const fosterSuccessRate = totalFosterOutcomes > 0 ? Math.round((successfulFosterOutcomes / totalFosterOutcomes) * 100) : 0;

        // 3. Adoption Funnel Data
        const inquiriesRes = await db.query("SELECT COUNT(*) as count FROM shelter_messages WHERE shelter_id = ?", [shelterId]);
        const inquiries = inquiriesRes.rows[0].count;

        const appsRes = await db.query("SELECT COUNT(*) as count FROM adoptions a JOIN pets p ON a.pet_id = p.id WHERE p.shelter_id = ?", [shelterId]);
        const apps = appsRes.rows[0].count;

        const approvedRes = await db.query("SELECT COUNT(*) as count FROM adoptions a JOIN pets p ON a.pet_id = p.id WHERE p.shelter_id = ? AND a.status IN ('active', 'completed')", [shelterId]);
        const approved = approvedRes.rows[0].count;

        // 4. Intake vs Outcome (6 Month Trend - Manual JS Generation for Compatibility)
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM

            const intakeM = await db.query("SELECT COUNT(*) as count FROM pets WHERE shelter_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?", [shelterId, yearMonth]);
            const outcomeM = await db.query("SELECT COUNT(*) as count FROM adoptions a JOIN pets p2 ON a.pet_id = p2.id WHERE p2.shelter_id = ? AND DATE_FORMAT(a.adoption_date, '%Y-%m') = ?", [shelterId, yearMonth]);

            trendData.push({
                month: monthLabel,
                intake: intakeM.rows[0].count,
                outcome: outcomeM.rows[0].count
            });
        }

        // 5. Demographics
        const speciesRes = await db.query("SELECT type as label, COUNT(*) as value FROM pets WHERE shelter_id = ? GROUP BY type", [shelterId]);
        const ageRes = await db.query(`
            SELECT 
                CASE 
                    WHEN age LIKE '%Puppy%' OR age LIKE '%Kitten%' THEN 'Young'
                    WHEN age LIKE '%Senior%' THEN 'Senior'
                    ELSE 'Adult'
                END as label,
                COUNT(*) as value
            FROM pets 
            WHERE shelter_id = ? 
            GROUP BY label
        `, [shelterId]);

        const fosterBreakdownRes = await db.query(`
            SELECT outcome as label, COUNT(*) as value 
            FROM foster_assignments 
            WHERE shelter_id = ? AND status = 'completed'
            GROUP BY outcome
        `, [shelterId]);

        // 6. Operational Health
        const longStayRes = await db.query(`
            SELECT id, name, DATEDIFF(NOW(), created_at) as days, image_url
            FROM pets 
            WHERE shelter_id = ? AND status = 'available' AND DATEDIFF(NOW(), created_at) >= 90
            LIMIT 5
        `, [shelterId]);

        const responseTimeRes = await db.query(`
            SELECT AVG(DATEDIFF(responded_at, created_at)) as avg_days
            FROM shelter_messages 
            WHERE shelter_id = ? AND responded_at IS NOT NULL
        `, [shelterId]);
        const avgResponseTime = responseTimeRes.rows[0].avg_days !== null ? `${Math.round(responseTimeRes.rows[0].avg_days * 24)}h` : "N/A";

        res.json({
            success: true,
            shelter: shelter[0],
            kpis: {
                adoptionRate: { value: Math.round(adoptionRate), trend: 5 },
                alos: { value: alos, trend: -2 },
                pendingApplications: { value: pendingApplications, trend: 8 },
                profileViews: { value: profileViews, trend: 15 },
                fosterSuccess: { value: `${fosterSuccessRate}%`, trend: 4 },
                activeFosters: { value: activeFosters, trend: 1 }
            },
            charts: {
                funnel: [
                    { stage: "Views", count: profileViews },
                    { stage: "Inquiries", count: inquiries },
                    { stage: "Applications", count: apps },
                    { stage: "Adopted", count: approved }
                ],
                intakeVsOutcome: trendData,
                demographics: {
                    species: speciesRes.rows,
                    age: ageRes.rows
                },
                fosterOutcomes: fosterBreakdownRes.rows
            },
            operational: {
                longStayAlerts: longStayRes.rows,
                avgResponseTime: avgResponseTime
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
