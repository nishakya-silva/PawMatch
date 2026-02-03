const db = require('../config/db');

class MatchingService {
    async findMatches(userProfile) {
        // 1. Fetch all available pets
        const result = await db.query("SELECT * FROM pets WHERE status = 'available'");
        const pets = result.rows;

        // 2. Score each pet
        const scoredPets = pets.map(pet => {
            // Helper to parse if string (MySQL compatibility)
            const parseJson = (val) => (typeof val === 'string' ? JSON.parse(val) : val);

            pet.living_situation_match = parseJson(pet.living_situation_match);
            pet.social_profile = parseJson(pet.social_profile);
            pet.temperament = parseJson(pet.temperament);

            let score = 0;
            let reasons = []; // To explain match
            let isDisqualified = false;

            // --- Hard Filters ---

            // Living Situation
            // Pet's living_situation_match is JSONB like {"apartment": false, "house_small": true}
            const livingSituation = userProfile['1']; // Question ID 1
            if (pet.living_situation_match && pet.living_situation_match[livingSituation] === false) {
                isDisqualified = true; // Pet strictly cannot live here
            } else if (pet.living_situation_match && pet.living_situation_match[livingSituation] === true) {
                score += 10; // Perfect environment
            }

            // Household (Kids)
            const household = userProfile['4']; // Question ID 4
            const hasKids = household === 'family_young' || household === 'family_older';
            const hasYoungKids = household === 'family_young';

            if (hasYoungKids && pet.social_profile && pet.social_profile.kids === false) {
                isDisqualified = true; // Not good with young kids
            }

            // Existing Pets
            const existingPets = userProfile['6']; // Question ID 6
            if (existingPets === 'dog' && pet.social_profile && pet.social_profile.dogs === false) {
                isDisqualified = true;
            }
            if (existingPets === 'cat' && pet.social_profile && pet.social_profile.cats === false) {
                isDisqualified = true;
            }

            // --- Weighted Scoring ---

            // Activity Level (Question 2)
            const userActivity = userProfile['2'];
            const activityMap = {
                'sedentary': 1,
                'moderate': 2,
                'active': 3,
                'athletic': 4
            };

            const petEnergyMap = {
                'sedentary': 1,
                'low': 1,
                'moderate': 2,
                'active': 3,
                'athletic': 4,
                'high': 4
            };

            const userLevel = activityMap[userActivity] || 2;
            const petLevel = petEnergyMap[pet.energy_level] || 2;
            const diff = Math.abs(userLevel - petLevel);

            if (diff === 0) {
                score += 30; // Perfect match
                reasons.push("Energy level matches yours perfectly");
            } else if (diff === 1) {
                score += 15; // Good match
            } else {
                score -= 10; // Mismatch
            }

            // Experience Level (Question 5)
            const experience = userProfile['5']; // first, some, experienced, expert
            if (experience === 'first' && (pet.energy_level === 'athletic' || pet.energy_level === 'high')) {
                score -= 20; // High energy dogs are hard for first timers
            }

            // Time Availability (Question 3)
            const time = userProfile['3']; // limited, moderate, flexible, full
            if (time === 'limited' && (pet.energy_level === 'active' || pet.energy_level === 'athletic')) {
                score -= 30; // Not enough time for high energy dog
                isDisqualified = true; // Preventing neglect
            }

            // Social Compatibility
            if (existingPets === 'dog' && pet.social_profile && pet.social_profile.dogs) {
                score += 10;
                reasons.push("Good with other dogs");
            }

            return {
                ...pet,
                matchScore: Math.max(0, Math.min(100, score + 50)), // Normalize somewhat to 0-100 base 50
                matchReasons: reasons,
                isDisqualified
            };
        });

        // 3. Filter and Sort
        return scoredPets
            .filter(p => !p.isDisqualified)
            .sort((a, b) => b.matchScore - a.matchScore);
    }
}

module.exports = new MatchingService();
