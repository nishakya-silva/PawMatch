const db = require('../config/db');

// Achievement definitions
const ACHIEVEMENTS = {
    FIRST_ADOPTION: 'first_adoption',
    TEN_DAY_STREAK: '10_day_streak',
    BONDING_MASTER: 'bonding_master'
};

// Check and award achievements
exports.checkAndAwardAchievements = async (userId) => {
    try {
        const achievements = [];
        
        // Check First Adoption
        const firstAdoptionResult = await checkFirstAdoption(userId);
        if (firstAdoptionResult.new) {
            achievements.push(firstAdoptionResult.achievement);
        }
        
        // Check 10 Day Streak
        const streakResult = await checkTenDayStreak(userId);
        if (streakResult.new) {
            achievements.push(streakResult.achievement);
        }
        
        // Check Bonding Master (90 days)
        const bondingResult = await checkBondingMaster(userId);
        if (bondingResult.new) {
            achievements.push(bondingResult.achievement);
        }
        
        return achievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

// Check if user has their first adoption
async function checkFirstAdoption(userId) {
    const connection = await db.pool.getConnection();
    try {
        // Check if user already has this achievement
        const existingResult = await connection.query(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_type = ?',
            [userId, ACHIEVEMENTS.FIRST_ADOPTION]
        );
        
        if (existingResult.rows && existingResult.rows.length > 0) {
            return { new: false };
        }
        
        // Check if user has at least one approved adoption
        const adoptionResult = await connection.query(
            'SELECT id, pet_id FROM adoptions WHERE user_id = ? AND status IN ("approved", "active", "completed") LIMIT 1',
            [userId]
        );
        
        if (adoptionResult.rows && adoptionResult.rows.length > 0) {
            const adoption = adoptionResult.rows[0];
            
            // Award the achievement
            await connection.query(
                'INSERT INTO user_achievements (user_id, achievement_type, related_data) VALUES (?, ?, ?)',
                [userId, ACHIEVEMENTS.FIRST_ADOPTION, JSON.stringify({ adoptionId: adoption.id, petId: adoption.pet_id })]
            );
            
            return {
                new: true,
                achievement: {
                    type: ACHIEVEMENTS.FIRST_ADOPTION,
                    title: 'First Adoption',
                    description: 'Welcomed your first pet',
                    icon: 'Award',
                    color: 'primary'
                }
            };
        }
        
        return { new: false };
    } finally {
        connection.release();
    }
}

// Check if user has maintained a 10-day streak
async function checkTenDayStreak(userId) {
    const connection = await db.pool.getConnection();
    try {
        // Check if user already has this achievement
        const existingResult = await connection.query(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_type = ?',
            [userId, ACHIEVEMENTS.TEN_DAY_STREAK]
        );
        
        if (existingResult.rows && existingResult.rows.length > 0) {
            return { new: false };
        }
        
        // Get user's adoptions and their welfare logs
        const logsResult = await connection.query(`
            SELECT wl.adoption_id, wl.log_date, a.created_at as adoption_date
            FROM welfare_logs wl
            JOIN adoptions a ON wl.adoption_id = a.id
            WHERE a.user_id = ?
            ORDER BY wl.log_date DESC
        `, [userId]);
        
        if (logsResult.rows && logsResult.rows.length > 0) {
            // Check for 10 consecutive days of logging
            const logs = logsResult.rows;
            let consecutiveDays = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < logs.length; i++) {
                const logDate = new Date(logs[i].log_date);
                logDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === consecutiveDays) {
                    consecutiveDays++;
                } else if (diffDays > consecutiveDays) {
                    break; // Gap in consecutive days
                }
            }
            
            if (consecutiveDays >= 10) {
                // Award the achievement
                await connection.query(
                    'INSERT INTO user_achievements (user_id, achievement_type, related_data) VALUES (?, ?, ?)',
                    [userId, ACHIEVEMENTS.TEN_DAY_STREAK, JSON.stringify({ streakDays: consecutiveDays })]
                );
                
                return {
                    new: true,
                    achievement: {
                        type: ACHIEVEMENTS.TEN_DAY_STREAK,
                        title: '10 Day Streak',
                        description: 'Consistent care tracking',
                        icon: 'TrendingUp',
                        color: 'accent'
                    }
                };
            }
        }
        
        return { new: false };
    } finally {
        connection.release();
    }
}

// Check if user has completed a 90-day journey
async function checkBondingMaster(userId) {
    const connection = await db.pool.getConnection();
    try {
        // Check if user already has this achievement
        const existingResult = await connection.query(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_type = ?',
            [userId, ACHIEVEMENTS.BONDING_MASTER]
        );
        
        if (existingResult.rows && existingResult.rows.length > 0) {
            return { new: false };
        }
        
        // Check if user has any adoption that's 90+ days old
        const adoptionResult = await connection.query(`
            SELECT id, pet_id, adoption_date, DATEDIFF(CURDATE(), adoption_date) as days_since_adoption
            FROM adoptions 
            WHERE user_id = ? AND status IN ("approved", "active", "completed")
            HAVING days_since_adoption >= 90
            LIMIT 1
        `, [userId]);
        
        if (adoptionResult.rows && adoptionResult.rows.length > 0) {
            const adoption = adoptionResult.rows[0];
            
            // Award the achievement
            await connection.query(
                'INSERT INTO user_achievements (user_id, achievement_type, related_data) VALUES (?, ?, ?)',
                [userId, ACHIEVEMENTS.BONDING_MASTER, JSON.stringify({ 
                    adoptionId: adoption.id, 
                    petId: adoption.pet_id,
                    daysCompleted: adoption.days_since_adoption 
                })]
            );
            
            return {
                new: true,
                achievement: {
                    type: ACHIEVEMENTS.BONDING_MASTER,
                    title: 'Bonding Master',
                    description: 'Complete 90 day journey',
                    icon: 'Heart',
                    color: 'muted'
                }
            };
        }
        
        return { new: false };
    } finally {
        connection.release();
    }
}

// Get all user achievements
exports.getUserAchievements = async (userId) => {
    try {
        const result = await db.query(`
            SELECT achievement_type, achieved_at, related_data 
            FROM user_achievements 
            WHERE user_id = ? 
            ORDER BY achieved_at DESC
        `, [userId]);
        
        const achievements = result.rows || result;
        
        // Map achievement types to display data
        const achievementMap = {
            [ACHIEVEMENTS.FIRST_ADOPTION]: {
                title: 'First Adoption',
                description: 'Welcomed your first pet',
                icon: 'Award',
                color: 'primary'
            },
            [ACHIEVEMENTS.TEN_DAY_STREAK]: {
                title: '10 Day Streak',
                description: 'Consistent care tracking',
                icon: 'TrendingUp',
                color: 'accent'
            },
            [ACHIEVEMENTS.BONDING_MASTER]: {
                title: 'Bonding Master',
                description: 'Complete 90 day journey',
                icon: 'Heart',
                color: 'muted'
            }
        };
        
        return achievements.map(a => ({
            type: a.achievement_type,
            achievedAt: a.achieved_at,
            relatedData: a.related_data ? JSON.parse(a.related_data) : null,
            ...achievementMap[a.achievement_type]
        }));
    } catch (error) {
        console.error('Error getting user achievements:', error);
        return [];
    }
};
