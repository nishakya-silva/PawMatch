-- Database Normalization: Refactoring 'users' into Multi-Table Inheritance

-- 1. Base Authentication Table
-- Stores credentials and security tokens for all user types.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('adopter', 'shelter', 'admin') NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE, -- Mapped from is_verified
    otp_hash VARCHAR(255),
    otp_expires_at DATETIME,
    reset_token_hash VARCHAR(255),
    reset_token_expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Adopters Profile Table
-- Specific attributes for Adopters.
CREATE TABLE IF NOT EXISTS adopters (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(255), -- Mapped from name
    phone_number VARCHAR(20),
    pawsonality_results JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Shelters Profile Table
-- Specific attributes for Shelter Partners.
CREATE TABLE IF NOT EXISTS shelters (
    user_id INT PRIMARY KEY,
    organization_name VARCHAR(255), -- Mapped from shelter_name
    contact_number VARCHAR(20), -- Mapped from phone_number
    registry_type ENUM('NGO_Secretariat', 'DAPH', 'Other'),
    registration_number VARCHAR(50) UNIQUE,
    verification_document_url TEXT,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Admins Profile Table
-- Specific attributes for System Administrators.
CREATE TABLE IF NOT EXISTS admins (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(255), -- Mapped from name
    department VARCHAR(100) DEFAULT 'General',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Re-creating other tables dependent on users (Updating Foreign Keys if necessary)
-- Note: Existing foreign keys pointing to 'users(id)' usually work fine as 'users' is still the parent table.
-- However, relationships specific to a role (e.g. adoptions) technically relate to the 'adopter', 
-- but linking to 'users(id)' is still valid and often preferred for simplicity unless strict integrity is needed.

-- Keeping existing tables for context (assuming they exist or will be migrated)
-- CREATE TABLE IF NOT EXISTS pets (...);
-- CREATE TABLE IF NOT EXISTS adoptions (...); 
-- etc.
