const db = require('../config/db');

class MatchingService {
    async findMatches(userProfile) {
        // 1. Fetch all available pets
        const res = await db.query("SELECT * FROM pets WHERE status = 'available'");
        const pets = res.rows || res[0]; // Compatibility for both mysql2 and pg

        // 2. Score each pet using weighted algorithm
        const scoredPets = pets.map(pet => {
            // Parse JSON fields if they are strings (typical in MySQL)
            const parseJson = (val) => {
                if (!val) return {};
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch (e) { return {}; }
                }
                return val;
            };

            const social = parseJson(pet.social_profile);
            const livingMatch = parseJson(pet.living_situation_match);
            const parsedTemp = parseJson(pet.temperament);
            const temperament = Array.isArray(parsedTemp) ? parsedTemp : (parsedTemp.tags || []);

            let score = 0;
            let reasons = [];
            let isDisqualified = false;

            // WEIGHTED CATEGORIES:
            // Activity (25%), Time (20%), Space (20%), Experience (15%), Pets (10%), Neighborhood (10%)

            // --- 1. Activity Level (25%) ---
            const userActivity = userProfile['2']; // sedentary, moderate, active, athletic
            const energyMap = { sedentary: 1, low: 1, moderate: 2, active: 3, athletic: 4, high: 4 };
            const userEnergy = energyMap[userActivity] || 2;
            const dogEnergy = energyMap[pet.energy_level] || 2;
            const energyDiff = Math.abs(userEnergy - dogEnergy);

            let activityPoints = 0;
            if (energyDiff === 0) activityPoints = 100;
            else if (energyDiff === 1) activityPoints = 70;
            else activityPoints = 30;

            score += activityPoints * 0.25;
            if (activityPoints >= 70) reasons.push("Matches your activity level well");

            // --- 2. Time Available (20%) ---
            const userTime = userProfile['3']; // limited, moderate, flexible, full
            let timePoints = 0;
            if (userTime === 'full' || userTime === 'flexible') timePoints = 100;
            else if (userTime === 'moderate') {
                timePoints = (pet.energy_level === 'high' || pet.energy_level === 'athletic') ? 50 : 100;
            } else { // limited
                if (pet.energy_level === 'high' || pet.energy_level === 'athletic') {
                    timePoints = 0;
                    isDisqualified = true; // Safety filter: high energy dogs shouldn't be with people with no time
                } else {
                    timePoints = 40;
                }
            }
            score += timePoints * 0.20;

            // --- 3. Living Space (20%) ---
            const userSpace = userProfile['1']; // apartment, house_small, house_large, rural
            let spacePoints = 0;
            if (livingMatch && livingMatch[userSpace] === true) {
                spacePoints = 100;
                reasons.push(`Perfect for your ${userSpace.replace('_', ' ')}`);
            } else if (livingMatch && livingMatch[userSpace] === false) {
                spacePoints = 0;
                // Don't strictly disqualify unless it's a huge dog in a tiny apartment with no exceptions
                if (pet.size === 'Large' && userSpace === 'apartment') isDisqualified = true;
            } else {
                spacePoints = 50;
            }
            score += spacePoints * 0.20;

            // --- 4. Experience (15%) ---
            const userExp = userProfile['5']; // first, some, experienced, expert
            const expRank = { first: 1, some: 2, experienced: 3, expert: 4 };
            const uExp = expRank[userExp] || 1;
            // High energy/Large dogs usually need level 3 (experienced)
            const dNeeds = (pet.energy_level === 'athletic' || pet.size === 'Large') ? 3 : 1;

            let expPoints = 0;
            if (uExp >= dNeeds) expPoints = 100;
            else expPoints = 40; // Needs guidance
            score += expPoints * 0.15;

            // --- 5. Other Pets (10%) ---
            const userExistingPets = userProfile['6'];
            const userPetDominance = userProfile['101']; // submissive, neutral, dominant
            const userPetSocial = userProfile['102']; // very_friendly, selective, nervous

            let petPoints = 100;
            if (userExistingPets === 'dog' && social.dogs === false) {
                petPoints = 0;
                isDisqualified = true;
            } else if (userExistingPets === 'cat' && social.cats === false) {
                petPoints = 0;
                isDisqualified = true;
            } else if (userExistingPets !== 'none') {
                // DEEP MATCHING
                reasons.push("Compatible with your current pets");

                // If user pet is dominant, we want a submissive dog
                if (userPetDominance === 'dominant' && (temperament.includes('Protective') || temperament.includes('Stubborn'))) {
                    petPoints -= 40; // Avoid friction
                } else if (userPetDominance === 'submissive' && temperament.includes('Gentle')) {
                    petPoints += 20; // Safe pair
                }

                // If user pet is nervous, shelter pet MUST be gentle/calm
                if (userPetSocial === 'nervous' && (pet.energy_level === 'high' || pet.energy_level === 'athletic')) {
                    petPoints -= 50;
                } else if (userPetSocial === 'nervous' && temperament.includes('Gentle')) {
                    petPoints += 30;
                }
            }
            score += Math.max(0, petPoints) * 0.10;

            // --- 6. Neighborhood (10%) ---
            const userEnv = userProfile['7']; // urban, suburban, semi_rural, rural
            let envPoints = 80; // Baseline
            if (userEnv === 'urban' && (pet.energy_level === 'athletic' || pet.size === 'Large')) {
                envPoints = 30;
            } else if (userEnv === 'rural' || userEnv === 'semi_rural') {
                envPoints = 100;
            }
            score += envPoints * 0.10;

            // Final Normalization and Response
            return {
                ...pet,
                matchScore: Math.round(score),
                matchReasons: reasons.slice(0, 3),
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
