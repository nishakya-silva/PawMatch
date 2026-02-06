-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    pawsonality_results JSON,
    role VARCHAR(20) DEFAULT 'adopter', -- 'adopter', 'shelter', 'admin'
    shelter_name VARCHAR(255), -- Only for shelters
    verification_status VARCHAR(20) DEFAULT 'unverified', -- unverified, pending, verified, rejected
    registry_type VARCHAR(50), -- NGO Secretariat, Dept of Animal Production
    registration_number VARCHAR(50),
    verification_document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pets Table
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Dog, Cat
    breed VARCHAR(100),
    age VARCHAR(50), -- "2 years", "4 months"
    gender VARCHAR(10),
    size VARCHAR(20), -- Small, Medium, Large
    energy_level VARCHAR(20), -- sedentary, moderate, active, athletic
    temperament JSON, -- Tags like "Friendly", "Shy", "Good with kids"
    social_profile JSON, -- {"dogs": true, "cats": false, "kids": true}
    living_situation_match JSON, -- {"apartment": true, "house_small": true}
    image_url VARCHAR(500),
    shelter_id INT, -- mock ID
    status VARCHAR(50) DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adoptions Table
CREATE TABLE IF NOT EXISTS adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pet_id INT,
    adoption_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, active, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pet_id) REFERENCES pets(id)
);

-- Welfare Logs Table
CREATE TABLE IF NOT EXISTS welfare_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adoption_id INT,
    log_date DATE DEFAULT (CURRENT_DATE),
    checklist JSON, -- {"morning_feed": true, "walk": true}
    mood VARCHAR(50),
    notes TEXT,
    risk_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adoption_id) REFERENCES adoptions(id)
);

-- Seed Data for Pets
INSERT INTO pets (name, type, breed, age, gender, size, energy_level, temperament, social_profile, living_situation_match, image_url, description) VALUES
('Bruno', 'Dog', 'Labrador Mix', '2 years', 'Male', 'Large', 'active', '["Friendly", "Playful", "Smart"]', '{"dogs": true, "cats": true, "kids": true}', '{"house_small": true, "house_large": true, "rural": true, "apartment": false}', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80', 'Bruno is a high-energy lab mix who loves to play fetch and swim.'),
('Luna', 'Dog', 'Beagle', '4 years', 'Female', 'Medium', 'moderate', '["Gentle", "Curious", "Food-motivated"]', '{"dogs": true, "cats": false, "kids": true}', '{"house_small": true, "house_large": true, "rural": true, "apartment": true}', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80', 'Luna is a sweet beagle who loves sniffaris and following her nose.'),
('Rocky', 'Dog', 'German Shepherd', '3 years', 'Male', 'Large', 'athletic', '["Loyal", "Protective", "Intelligent"]', '{"dogs": false, "cats": false, "kids": false}', '{"house_large": true, "rural": true, "apartment": false, "house_small": false}', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80', 'Rocky needs an experienced handler and lots of exercise.'),
('Bella', 'Dog', 'Pug', '5 years', 'Female', 'Small', 'sedentary', '["Affectionate", "Calm", "Funny"]', '{"dogs": true, "cats": true, "kids": true}', '{"apartment": true, "house_small": true, "house_large": true, "rural": true}', 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80', 'Bella loves to cuddle and nap. Perfect for apartment living.');

ALTER TABLE users 
ADD COLUMN otp_hash VARCHAR(255),
ADD COLUMN otp_expires_at DATETIME,
ADD COLUMN reset_token_hash VARCHAR(255),
ADD COLUMN reset_token_expires_at DATETIME,
ADD COLUMN nic VARCHAR(20),
ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN sms_alerts BOOLEAN DEFAULT TRUE;

ALTER TABLE pets
ADD COLUMN is_foster BOOLEAN DEFAULT FALSE;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Animal Reports Table
CREATE TABLE IF NOT EXISTS animal_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_type VARCHAR(50),
    condition_type VARCHAR(50),
    location VARCHAR(255),
    description TEXT,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending Users Table
CREATE TABLE IF NOT EXISTS pending_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    nic VARCHAR(20),
    otp_hash VARCHAR(255),
    otp_expires_at DATETIME,
    role VARCHAR(20) DEFAULT 'adopter',
    shelter_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shelter Messages Table
CREATE TABLE IF NOT EXISTS shelter_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    adoption_id INT,
    shelter_id INT,
    subject VARCHAR(255),
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pet_id INT,
    response TEXT,
    responded_at DATETIME
);

-- Shelter Visits Table
CREATE TABLE IF NOT EXISTS shelter_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pet_id INT,
    shelter_id INT,
    visit_date DATE,
    visit_time TIME,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Animal Reports
INSERT INTO animal_reports (animal_type, condition_type, location, description, contact_name, contact_phone, status) VALUES
('Dog', 'Injured', 'Mount Lavinia Beach', 'Brown dog with a limp on the left hind leg.', 'Saman Kumara', '0771234567', 'pending'),
('Cat', 'Abandoned', 'Dehiwala Zoo Road', 'Kittens left in a box near the entrance.', 'Nimal Perera', '0719876543', 'investigating');

-- Seed Data for Shelter Visits
INSERT INTO shelter_visits (user_id, pet_id, shelter_id, visit_date, visit_time, status, notes) VALUES
(1, 1, 1, '2023-10-25', '10:00:00', 'confirmed', 'First time meeting Bruno'),
(1, 2, 1, '2023-10-26', '14:30:00', 'pending', 'Interested in Luna');
