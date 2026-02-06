const db = require('./config/db');

const fosterPets = [
    {
        name: 'Finn',
        type: 'Dog',
        breed: 'Golden Retriever Mix',
        age: '6 months',
        gender: 'Male',
        size: 'Medium',
        energy_level: 'active',
        temperament: JSON.stringify(['Playful', 'Bouncy', 'Fast Learner']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80',
        description: 'Finn is looking for a foster family to help him learn basic manners while he waits for his forever home.',
        is_foster: true
    },
    {
        name: 'Mochi',
        type: 'Dog',
        breed: 'Pomeranian',
        age: '3 years',
        gender: 'Female',
        size: 'Small',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Sweet', 'Lap dog', 'Shy']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: false }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80',
        description: 'Mochi needs a quiet foster home to build her confidence after being rescued from a busy environment.',
        is_foster: true
    },
    {
        name: 'Toby',
        type: 'Dog',
        breed: 'Local Mix',
        age: '4 years',
        gender: 'Male',
        size: 'Medium',
        energy_level: 'low',
        temperament: JSON.stringify(['Chill', 'Observant', 'Loyal']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80',
        description: 'Toby is the perfect low-maintenance companion. He loves short walks and long naps.',
        is_foster: true
    },
    {
        name: 'Ginger',
        type: 'Dog',
        breed: 'Labrador',
        age: '1 year',
        gender: 'Female',
        size: 'Large',
        energy_level: 'active',
        temperament: JSON.stringify(['Energetic', 'Friendly', 'Outdoor-lover']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80',
        description: 'Ginger is still a puppy at heart and needs a yard to burn off her zoomies.',
        is_foster: true
    },
    {
        name: 'Simba',
        type: 'Dog',
        breed: 'Husky',
        age: '2 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'athletic',
        temperament: JSON.stringify(['Talkative', 'Stubborn', 'Very Active']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: false, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80',
        description: 'Simba is a high-energy husky who needs an active foster parent who loves hiking.',
        is_foster: true
    },
    {
        name: 'Nala',
        type: 'Dog',
        breed: 'Border Collie Mix',
        age: '3 years',
        gender: 'Female',
        size: 'Medium',
        energy_level: 'athletic',
        temperament: JSON.stringify(['Smart', 'Responsive', 'Agile']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1503256207526-0e5d99fee5ad?auto=format&fit=crop&q=80',
        description: 'Nala is incredibly smart and would love to learn more tricks in her foster home.',
        is_foster: true
    },
    {
        name: 'Oreo',
        type: 'Dog',
        breed: 'Dalmatian Mix',
        age: '5 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Dignified', 'Reserved', 'Faithful']),
        social_profile: JSON.stringify({ dogs: false, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80',
        description: 'Oreo is a calm presence who enjoys being around people but values his space.',
        is_foster: true
    },
    {
        name: 'Coco',
        type: 'Dog',
        breed: 'Chihuahua Mix',
        age: '8 years',
        gender: 'Female',
        size: 'Small',
        energy_level: 'sedentary',
        temperament: JSON.stringify(['Sassy', 'Cuddly', 'Independent']),
        social_profile: JSON.stringify({ dogs: false, cats: true, kids: false }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80',
        description: 'Coco is a senior girl who just wants a warm lap and a quiet place to snooze.',
        is_foster: true
    },
    {
        name: 'Buster',
        type: 'Dog',
        breed: 'Boxer Mix',
        age: '2 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'active',
        temperament: JSON.stringify(['Goofy', 'Powerful', 'Loving']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: false, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80',
        description: 'Buster is a big goofball who doesn\'t realize his own size. He needs help with leash manners.',
        is_foster: true
    },
    {
        name: 'Winnie',
        type: 'Dog',
        breed: 'Corgi Mix',
        age: '1 year',
        gender: 'Female',
        size: 'Small',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Alert', 'Cheerful', 'Stubborn']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&q=80',
        description: 'Winnie is short on legs but big on heart (and attitude). She\'s a joy to be around.',
        is_foster: true
    },
    {
        name: 'Duke',
        type: 'Dog',
        breed: 'German Shepherd',
        age: '4 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'active',
        temperament: JSON.stringify(['Loyal', 'Watchful', 'Brave']),
        social_profile: JSON.stringify({ dogs: false, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80',
        description: 'Duke is a noble protector who form a strong bond with his foster handler.',
        is_foster: true
    },
    {
        name: 'Cleo',
        type: 'Dog',
        breed: 'Local Breed',
        age: '7 months',
        gender: 'Female',
        size: 'Medium',
        energy_level: 'active',
        temperament: JSON.stringify(['Scared', 'Needs patience', 'Potential to shine']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80',
        description: 'Cleo was found alone and is very shy. She needs a patient foster to show her that the world is okay.',
        is_foster: true
    }
];

async function seed() {
    try {
        for (const pet of fosterPets) {
            await db.query(
                `INSERT INTO pets (name, type, breed, age, gender, size, energy_level, temperament, social_profile, living_situation_match, image_url, description, is_foster) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [pet.name, pet.type, pet.breed, pet.age, pet.gender, pet.size, pet.energy_level, pet.temperament, pet.social_profile, pet.living_situation_match, pet.image_url, pet.description, pet.is_foster]
            );
        }
        console.log('Successfully seeded 12 foster pets');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
