const db = require('./config/db');

const pets = [
    {
        name: 'Zoe',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: '4 months',
        gender: 'Female',
        size: 'Small',
        energy_level: 'active',
        temperament: JSON.stringify(['Playful', 'Curious', 'Friendly']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80',
        description: 'Zoe is a bundle of joy looking for a family to grow up with.'
    },
    {
        name: 'Max',
        type: 'Dog',
        breed: 'Bulldog',
        age: '5 years',
        gender: 'Male',
        size: 'Medium',
        energy_level: 'sedentary',
        temperament: JSON.stringify(['Calm', 'Stubborn', 'Affectionate']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80',
        description: 'Max is a professional napper who loves snacks.'
    },
    {
        name: 'Daisy',
        type: 'Dog',
        breed: 'Poodle Mix',
        age: '1 year',
        gender: 'Female',
        size: 'Medium',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Intelligent', 'Alert', 'Active']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80',
        description: 'Daisy is smart, quick to learn, and very loyal.'
    },
    {
        name: 'Cooper',
        type: 'Dog',
        breed: 'Labrador Retriever',
        age: '8 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Gentle', 'Kind', 'Trustworthy']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1444212477490-ca40a0fd1f2a?auto=format&fit=crop&q=80',
        description: 'Cooper is a senior gentleman who loves slow walks.'
    },
    {
        name: 'Milo',
        type: 'Dog',
        breed: 'Beagle',
        age: '6 months',
        gender: 'Male',
        size: 'Small',
        energy_level: 'active',
        temperament: JSON.stringify(['Inquisitive', 'Merry', 'Determined']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80',
        description: 'Milo follows his nose everywhere! Great for active families.'
    },
    {
        name: 'Sadie',
        type: 'Dog',
        breed: 'Boxer',
        age: '3 years',
        gender: 'Female',
        size: 'Large',
        energy_level: 'athletic',
        temperament: JSON.stringify(['Energetic', 'Devoted', 'Fearless']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: false }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: false, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80',
        description: 'Sadie needs a lot of exercise and a strong leader.'
    },
    {
        name: 'Charlie',
        type: 'Dog',
        breed: 'Dachshund',
        age: '2 years',
        gender: 'Male',
        size: 'Small',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Clever', 'Stubborn', 'Lively']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&q=80',
        description: 'Charlie is small in size but big in personality.'
    },
    {
        name: 'Bailey',
        type: 'Dog',
        breed: 'Shih Tzu',
        age: '10 years',
        gender: 'Female',
        size: 'Small',
        energy_level: 'sedentary',
        temperament: JSON.stringify(['Affectionate', 'Outgoing', 'Playful']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1506755855567-92ff770e8d30?auto=format&fit=crop&q=80',
        description: 'Bailey is a sweet senior who just wants a lap to sit on.'
    },
    {
        name: 'Ruby',
        type: 'Dog',
        breed: 'Husky Mix',
        age: '5 months',
        gender: 'Female',
        size: 'Medium',
        energy_level: 'athletic',
        temperament: JSON.stringify(['Adventurous', 'Talkative', 'Stubborn']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: false, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80',
        description: 'Ruby is high energy and loves the cold! Needs lots of activity.'
    },
    {
        name: 'Bear',
        type: 'Dog',
        breed: 'Rottweiler',
        age: '4 years',
        gender: 'Male',
        size: 'Large',
        energy_level: 'active',
        temperament: JSON.stringify(['Steady', 'Confident', 'Good-natured']),
        social_profile: JSON.stringify({ dogs: false, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?auto=format&fit=crop&q=80',
        description: 'Bear is a loyal protector and a gentle giant at heart.'
    },
    {
        name: 'Sophie',
        type: 'Dog',
        breed: 'Terrier Mix',
        age: '2 years',
        gender: 'Female',
        size: 'Small',
        energy_level: 'active',
        temperament: JSON.stringify(['Alert', 'Feisty', 'Intelligent']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80',
        description: 'Sophie loves chasing balls and exploring new trails.'
    },
    {
        name: 'Buster',
        type: 'Dog',
        breed: 'Cocker Spaniel',
        age: '7 years',
        gender: 'Male',
        size: 'Medium',
        energy_level: 'moderate',
        temperament: JSON.stringify(['Gentle', 'Smart', 'Happy']),
        social_profile: JSON.stringify({ dogs: true, cats: true, kids: true }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&q=80',
        description: 'Buster is a happy-go-lucky dog who gets along with everyone.'
    },
    {
        name: 'Coco',
        type: 'Dog',
        breed: 'Chihuahua',
        age: '3 months',
        gender: 'Female',
        size: 'Small',
        energy_level: 'sedentary',
        temperament: JSON.stringify(['Graceful', 'Devoted', 'Nervous']),
        social_profile: JSON.stringify({ dogs: false, cats: true, kids: false }),
        living_situation_match: JSON.stringify({ apartment: true, house_small: true, house_large: false, rural: false }),
        image_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80',
        description: 'Coco is tiny and sweet, looking for a quiet home.'
    },
    {
        name: 'Oliver',
        type: 'Dog',
        breed: 'Border Collie',
        age: '3 years',
        gender: 'Male',
        size: 'Medium',
        energy_level: 'athletic',
        temperament: JSON.stringify(['Intelligent', 'Energetic', 'Responsive']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: false, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1503256207526-0e5d99fee5ad?auto=format&fit=crop&q=80',
        description: 'Oliver needs a job to do! Extremely smart and active.'
    },
    {
        name: 'Rex',
        type: 'Dog',
        breed: 'German Shepherd Mix',
        age: '1 year',
        gender: 'Male',
        size: 'Large',
        energy_level: 'active',
        temperament: JSON.stringify(['Watchful', 'Obedient', 'Bold']),
        social_profile: JSON.stringify({ dogs: true, cats: false, kids: true }),
        living_situation_match: JSON.stringify({ apartment: false, house_small: true, house_large: true, rural: true }),
        image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80',
        description: 'Rex is a loyal companion in training. Ready for adventure.'
    }
];

async function seed() {
    try {
        for (const pet of pets) {
            await db.query(
                `INSERT INTO pets (name, type, breed, age, gender, size, energy_level, temperament, social_profile, living_situation_match, image_url, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [pet.name, pet.type, pet.breed, pet.age, pet.gender, pet.size, pet.energy_level, pet.temperament, pet.social_profile, pet.living_situation_match, pet.image_url, pet.description]
            );
        }
        console.log('Successfully seeded 15 pets');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
