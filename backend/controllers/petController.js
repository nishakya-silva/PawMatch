const db = require('../config/db');
const { upload } = require('../config/cloudinary');

exports.uploadMiddleware = upload.single('image');

exports.addPet = async (req, res) => {
    try {
        const {
            name, type, breed, age, gender, size, energy_level,
            temperament, social_profile, living_situation_match, description, shelter_id
        } = req.body;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const imageUrl = req.file.path; // Cloudinary URL key is 'path' or 'secure_url' in newer versions, usually path works with multer-storage-cloudinary
        // Actually, multer-storage-cloudinary puts 'path' as the url. Let's verify or use secure_url if available.
        // It's usually req.file.path which is the secure url.

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and Type are required' });
        }

        // Parse JSON fields if they are sent as strings (from FormData)
        let parsedTemperament = temperament;
        let parsedSocial = social_profile;
        let parsedLiving = living_situation_match;

        try {
            if (typeof temperament === 'string') parsedTemperament = JSON.parse(temperament);
            if (typeof social_profile === 'string') parsedSocial = JSON.parse(social_profile);
            if (typeof living_situation_match === 'string') parsedLiving = JSON.parse(living_situation_match);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Continue with potentially invalid data or handle error. 
            // For now, let's assume valid JSON strings or objects.
        }

        // Ensure they are strings for SQL if the DB expects JSON column but the driver expects stringified JSON
        // The pg driver usually handles objects for JSONB, but mysql2 might need string if prepared statement?
        // Let's assume the DB helper handles it, but standard practice with mysql:
        const temperamentStr = JSON.stringify(parsedTemperament || []);
        const socialStr = JSON.stringify(parsedSocial || {});
        const livingStr = JSON.stringify(parsedLiving || {});

        const query = `
            INSERT INTO pets (
                name, type, breed, age, gender, size, energy_level, 
                temperament, social_profile, living_situation_match, 
                image_url, description, shelter_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name, type, breed, age, gender, size, energy_level,
            temperamentStr, socialStr, livingStr,
            imageUrl, description, shelter_id || 1 // Default to 1 if not provided
        ];

        const result = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Pet added successfully',
            pet: {
                id: result.insertId,
                name,
                profile_image_url: imageUrl // Returning profile_image_url as requested
            }
        });

    } catch (error) {
        console.error('Add Pet Error:', error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};

exports.getAllPets = async (req, res) => {
    try {
        const pets = await db.query('SELECT * FROM pets ORDER BY created_at DESC');

        // Map to include profile_image_url for frontend consistency
        const mappedPets = pets.rows.map(pet => ({
            ...pet,
            profile_image_url: pet.image_url
        }));

        res.json({ success: true, count: mappedPets.length, pets: mappedPets });
    } catch (error) {
        console.error('Get Pets Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
