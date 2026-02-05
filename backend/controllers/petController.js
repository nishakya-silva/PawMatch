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
        const { status } = req.query;
        let query = 'SELECT * FROM pets';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const pets = await db.query(query, params);

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
exports.getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching pet with ID: ${id}`);
        const pets = await db.query('SELECT * FROM pets WHERE id = ?', [id]);

        if (pets.rows.length === 0) {
            console.log(`Pet not found in DB with ID: ${id}`);
            return res.status(404).json({ error: 'Pet not found' });
        }

        const pet = pets.rows[0];

        // Robust JSON parsing
        try {
            if (typeof pet.temperament === 'string' && pet.temperament.trim()) {
                pet.temperament = JSON.parse(pet.temperament);
            }
            if (typeof pet.social_profile === 'string' && pet.social_profile.trim()) {
                pet.social_profile = JSON.parse(pet.social_profile);
            }
            if (typeof pet.living_situation_match === 'string' && pet.living_situation_match.trim()) {
                pet.living_situation_match = JSON.parse(pet.living_situation_match);
            }
        } catch (parseError) {
            console.error('JSON Parse Error for pet:', id, parseError);
            // Non-fatal error for the API, but good to know
        }

        res.json({
            success: true,
            pet: {
                ...pet,
                profile_image_url: pet.image_url
            }
        });
    } catch (error) {
        console.error('getPetById Error:', error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};
