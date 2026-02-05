const db = require('../config/db');

/**
 * Logs a user activity to the database activity_logs table.
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action (e.g., 'ADOPTION_APPLICATION').
 * @param {object} details - Any additional details as a JSON object.
 */
async function logActivity(userId, actionType, details = {}) {
    try {
        await db.query(
            "INSERT INTO activity_logs (user_id, action_type, details) VALUES (?, ?, ?)",
            [userId, actionType, JSON.stringify(details)]
        );
        console.log(`[ACTIVITY LOG] User ${userId} performed ${actionType}`);
    } catch (error) {
        console.error("Critical Error: Failed to write to activity_logs:", error);
        // We don't throw here to avoid failing the main request if logging fails,
        // but in a real app, you might want more robust error handling.
    }
}

module.exports = { logActivity };
