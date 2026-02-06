-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    achievement_type VARCHAR(50) NOT NULL, -- 'first_adoption', '10_day_streak', 'bonding_master'
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_data JSON, -- Store additional data like adoption_id, streak_count, etc.
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_achievement (user_id, achievement_type)
);

-- Achievement Definitions
-- first_adoption: User completes their first adoption
-- 10_day_streak: User maintains 10-day streak in welfare tracking
-- bonding_master: User completes 90-day journey for any pet
