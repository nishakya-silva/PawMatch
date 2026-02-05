const db = require('../config/db');

exports.submitReport = async (req, res) => {
    try {
        const { animalType, condition, location, description, contactName, contactPhone } = req.body;

        if (!animalType || !condition || !location) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const query = `
            INSERT INTO animal_reports (animal_type, condition_type, location, description, contact_name, contact_phone)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [animalType, condition, location, description, contactName, contactPhone];

        const result = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            reportId: result.insertId || result.rows?.insertId
        });
    } catch (error) {
        console.error('Submit Report Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getRecentReports = async (req, res) => {
    try {
        const query = 'SELECT * FROM animal_reports ORDER BY created_at DESC LIMIT 10';
        const result = await db.query(query);
        const reports = result.rows || result;

        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error('Get Recent Reports Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check if report exists and is pending
        const checkQuery = 'SELECT status FROM animal_reports WHERE id = ?';
        const checkResult = await db.query(checkQuery, [id]);
        const reports = checkResult.rows || checkResult;

        if (reports.length === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        if (reports[0].status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Cannot cancel report that is already being processed or resolved' });
        }

        // 2. Delete report
        const deleteQuery = 'DELETE FROM animal_reports WHERE id = ?';
        await db.query(deleteQuery, [id]);

        res.status(200).json({ success: true, message: 'Report cancelled successfully' });
    } catch (error) {
        console.error('Delete Report Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
