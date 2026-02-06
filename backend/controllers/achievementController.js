const { getUserAchievements, checkAndAwardAchievements } = require('../services/achievementService');

exports.getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check for new achievements first
        await checkAndAwardAchievements(userId);

        const achievements = await getUserAchievements(userId);

        res.json({
            success: true,
            achievements: achievements
        });
    } catch (error) {
        console.error('Error getting user achievements:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
