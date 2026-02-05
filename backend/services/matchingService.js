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

            // Living Situation (Q1)
            const livingSituation = userProfile['1'];
            if (pet.living_situation_match && pet.living_situation_match[livingSituation] === false) {
                isDisqualified = true;
            } else if (pet.living_situation_match && pet.living_situation_match[livingSituation] === true) {
                score += 15;
                reasons.push(`Perfect fit for your ${livingSituation.replace('_', ' ')}`);
            }

            // Household (Q4)
            const household = userProfile['4'];
            const hasYoungKids = household === 'family_young';
            if (hasYoungKids && pet.social_profile && pet.social_profile.kids === false) {
                isDisqualified = true;
            } else if (hasYoungKids && pet.social_profile && pet.social_profile.kids === true) {
                score += 10;
                reasons.push("Great with young children");
            }

            // Existing Pets (Q6)
            const existingPets = userProfile['6'];
            if (existingPets === 'dog' && pet.social_profile && pet.social_profile.dogs === false) {
                isDisqualified = true;
            } else if (existingPets === 'dog' && pet.social_profile && pet.social_profile.dogs === true) {
                score += 10;
                reasons.push("Friendly toward your other dogs");
            }
            if (existingPets === 'cat' && pet.social_profile && pet.social_profile.cats === false) {
                isDisqualified = true;
            }

            // Environment (Q7)
            const environment = userProfile['7']; // urban, suburban, semi_rural, rural
            if (environment === 'urban' && (pet.energy_level === 'athletic' || pet.size === 'Large')) {
                score -= 10; // Urban might be tough for very large/athletic dogs
            } else if (environment === 'rural') {
                score += 5; // Most dogs love rural
            }

            // --- Weighted Scoring ---

            // Activity Level (Q2)
            const userActivity = userProfile['2'];
            const activityMap = { 'sedentary': 1, 'moderate': 2, 'active': 3, 'athletic': 4 };
            const petEnergyMap = { 'sedentary': 1, 'low': 1, 'moderate': 2, 'active': 3, 'athletic': 4, 'high': 4 };
            const userLevel = activityMap[userActivity] || 2;
            const petLevel = petEnergyMap[pet.energy_level] || 2;
            const diff = Math.abs(userLevel - petLevel);

            if (diff === 0) {
                score += 30;
                reasons.push("Matches your energy level perfectly");
            } else if (diff === 1) {
                score += 15;
            } else {
                score -= 15;
            }

            // Experience Level (Q5)
            const experience = userProfile['5'];
            if (experience === 'first' && (pet.energy_level === 'athletic' || pet.energy_level === 'high')) {
                score -= 20;
            } else if (experience === 'expert') {
                score += 10;
            }

            // Time Availability (Q3)
            const timeAvailable = userProfile['3'];
            if (timeAvailable === 'limited' && (pet.energy_level === 'active' || pet.energy_level === 'athletic')) {
                isDisqualified = true; // Still disqualifying for safety
            } else if (timeAvailable === 'full') {
                score += 10;
                reasons.push("Ideal for someone with a lot of time to bond");
            }

            // Final Normalization
            const matchScore = Math.max(0, Math.min(100, score + 40));

            return {
                ...pet,
                matchScore,
                matchReasons: reasons.slice(0, 3), // Limit to top 3 reasons
                isDisqualified,
                profile_image_url: pet.image_url
            };
        });

        // 3. Filter and Sort
        return scoredPets
            .filter(p => !p.isDisqualified)
            .sort((a, b) => b.matchScore - a.matchScore);
    }
}

module.exports = new MatchingService();
