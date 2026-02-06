const db = require('./config/db');
const bcrypt = require('bcryptjs');

const shelters = [
    {
        name: 'The Colombo Canine & Feline Sanctuary',
        email: 'colombo@pawmatch.lk',
        address: '123 Bauddhaloka Mawatha, Colombo 07',
        tagline: 'Providing refuge in the heart of the city',
        lat: 6.9271,
        lng: 79.8612,
        code: 'COL001',
        slug: 'colombo-canine-sanctuary'
    },
    {
        name: 'Hill Country Animal Rescue',
        email: 'kandy@pawmatch.lk',
        address: '45 Lake Round, Kandy',
        tagline: 'Hope for the highland paws',
        lat: 7.2906,
        lng: 80.6337,
        code: 'KAN001',
        slug: 'hill-country-animal-rescue'
    },
    {
        name: 'Southern Province Pet Haven',
        email: 'galle@pawmatch.lk',
        address: '89 Fort Road, Galle',
        tagline: 'Rescuing coastal companions',
        lat: 6.0535,
        lng: 80.2210,
        code: 'GAL001',
        slug: 'southern-province-pet-haven'
    },
    {
        name: 'Northern Paws Unity',
        email: 'jaffna@pawmatch.lk',
        address: '12 Hospital Road, Jaffna',
        tagline: 'Unity for animals in the north',
        lat: 9.6615,
        lng: 80.0255,
        code: 'JAF001',
        slug: 'northern-paws-unity'
    },
    {
        name: 'East Coast Rescue Network',
        email: 'trinco@pawmatch.lk',
        address: '67 Nilaveli Road, Trincomalee',
        tagline: 'Protecting animals across the eastern shores',
        lat: 8.5711,
        lng: 81.2335,
        code: 'TRI001',
        slug: 'east-coast-rescue-network'
    }
];

const dogBreeds = ['Local Mix', 'Labrador', 'Golden Retriever', 'German Shepherd', 'Pomeranian', 'Dachshund', 'Beagle'];
const catBreeds = ['Domestic Shorthair', 'Persian', 'Siamese', 'Calico', 'Tabby'];
const temperaments = ['Playful', 'Calm', 'Protective', 'Shy', 'Energetic', 'Affectionate', 'Independent'];
const energyLevels = ['low', 'moderate', 'active', 'athletic'];

async function seed() {
    try {
        const passwordHash = await bcrypt.hash('Password123!', 10);

        // Cleanup existing test shelters to allow re-runs
        const emails = shelters.map(s => s.email);
        const [existing] = await db.pool.query(`SELECT id FROM users WHERE email IN (?)`, [emails]);
        if (existing.length > 0) {
            const ids = existing.map(u => u.id);
            await db.query(`DELETE FROM pets WHERE shelter_id IN (?)`, [ids]);
            await db.query(`DELETE FROM users WHERE id IN (?)`, [ids]);
            console.log('Cleaned up existing test shelters and their pets.');
        }

        for (const sData of shelters) {
            // 1. Create Shelter User
            const result = await db.query(
                `INSERT INTO users (name, email, password_hash, role, shelter_name, verification_status, shelter_code, shelter_address, shelter_tagline, shelter_slug, latitude, longitude, is_verified) 
                 VALUES (?, ?, ?, 'shelter', ?, 'verified', ?, ?, ?, ?, ?, ?, 1)`,
                [sData.name, sData.email, passwordHash, sData.name, sData.code, sData.address, sData.tagline, sData.slug, sData.lat, sData.lng]
            );

            const shelterId = result.rows.insertId;
            console.log(`Created shelter: ${sData.name} (ID: ${shelterId})`);

            // 2. Create 10 Pets for this shelter
            for (let i = 1; i <= 10; i++) {
                const isDog = Math.random() > 0.3;
                const type = isDog ? 'Dog' : 'Cat';
                const breed = isDog ? dogBreeds[Math.floor(Math.random() * dogBreeds.length)] : catBreeds[Math.floor(Math.random() * catBreeds.length)];
                const name = `${type} ${sData.code}-${i}`;
                const age = `${Math.floor(Math.random() * 8) + 1} years`;
                const gender = Math.random() > 0.5 ? 'Male' : 'Female';
                const size = ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)];
                const energy = energyLevels[Math.floor(Math.random() * energyLevels.length)];
                const isFoster = i % 3 === 0; // Every 3rd pet is foster

                const traitIndices = new Set();
                while (traitIndices.size < 2) {
                    traitIndices.add(Math.floor(Math.random() * temperaments.length));
                }
                const tempArr = Array.from(traitIndices).map(idx => temperaments[idx]);
                const social = { dogs: true, cats: Math.random() > 0.5, kids: true };
                const match = { apartment: isDog ? false : true, house_small: true, house_large: true, rural: true };

                const imageUrl = isDog
                    ? `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400`
                    : `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400`;

                await db.query(
                    `INSERT INTO pets (name, type, breed, age, gender, size, energy_level, temperament, social_profile, living_situation_match, image_url, description, is_foster, shelter_id, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
                    [
                        name, type, breed, age, gender, size, energy,
                        JSON.stringify(tempArr),
                        JSON.stringify(social),
                        JSON.stringify(match),
                        imageUrl,
                        `${name} is a wonderful ${breed} looking for a ${isFoster ? 'trial home' : 'forever family'}. Excels in ${tempArr.join(' and ')} personalities.`,
                        isFoster,
                        shelterId
                    ]
                );
            }
            console.log(`  Added 10 pets to ${sData.name}`);
        }

        console.log('\nSeeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
