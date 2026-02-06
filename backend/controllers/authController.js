const crypto = require('crypto');
const db = require('../config/db');
const { logActivity } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const nicValidator = require('../utils/nicValidator');

// Helper to generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, nic, role, shelter_name } = req.body;

        // 1. Basic Validation
        const userRole = role === 'shelter' ? 'shelter' : 'adopter';

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        // 2. NIC/Registration Number Validation
        // For shelters, we treat NIC input as Registration Number if provided, or handle per requirements
        let cleanNic = null;
        if (nic) {
            // If it's a personal NIC, validate it. If it's a shelter Reg No, we might skip standard NIC validation
            if (userRole === 'adopter') {
                const nicValidation = nicValidator(nic);
                if (!nicValidation.valid) {
                    return res.status(400).json({ error: `Invalid NIC: ${nicValidation.error}` });
                }
                cleanNic = nicValidation.nic;
            } else {
                // For shelters, just clean the input
                cleanNic = nic.trim();
            }
        }

        // 3. Check if user exists in MAIN users table
        const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // 4. Hash Password & Generate OTP
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, otpSalt);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 5. Handle Pending Users (Upsert Logic)
        const pendingCheck = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
        
        if (pendingCheck.rows.length > 0) {
            // Update existing pending record
            await db.query(
                'UPDATE pending_users SET name = ?, password_hash = ?, phone_number = ?, nic = ?, role = ?, shelter_name = ?, otp_hash = ?, otp_expires_at = ? WHERE email = ?',
                [name, hashedPassword, phone || null, cleanNic, userRole, shelter_name || null, otpHash, otpExpiresAt, email]
            );
        } else {
            // Insert new pending user
            await db.query(
                'INSERT INTO pending_users (name, email, password_hash, phone_number, role, shelter_name, is_verified, nic, otp_hash, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, phone || null, userRole, shelter_name || null, false, cleanNic, otpHash, otpExpiresAt]
            );
        }

        await emailService.sendOTP(email, otp);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email.',
            requiresVerification: true,
            email: email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.verifyEmail = async (req, res) => {
    // Get a dedicated connection for Transaction
    const connection = await db.pool.getConnection(); 
    
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // 1. Find in Pending
        const [pendingUsers] = await connection.query('SELECT * FROM pending_users WHERE email = ?', [email]);
        if (pendingUsers.length === 0) {
            connection.release();
            return res.status(400).json({ error: 'Verification record not found or already verified' });
        }

        const pendingUser = pendingUsers[0];

        // 2. Check Expiry
        if (new Date() > new Date(pendingUser.otp_expires_at)) {
            connection.release();
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // 3. Verify OTP Hash
        const isMatch = await bcrypt.compare(otp, pendingUser.otp_hash);
        if (!isMatch) {
            connection.release();
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // --- START TRANSACTION ---
        await connection.beginTransaction();

        try {
            // 4. Insert into Base Table (USERS)
            const [insertRes] = await connection.query(
                'INSERT INTO users (email, password_hash, role, is_email_verified) VALUES (?, ?, ?, TRUE)',
                [pendingUser.email, pendingUser.password_hash, pendingUser.role]
            );
            
            const newUserId = insertRes.insertId;

            // 5. Insert into Profile Table based on Role
            if (pendingUser.role === 'shelter') {
                await connection.query(
                    'INSERT INTO shelters (user_id, organization_name, contact_number, registration_number, verification_status) VALUES (?, ?, ?, ?, ?)',
                    [
                        newUserId, 
                        pendingUser.shelter_name || pendingUser.name, 
                        pendingUser.phone_number, 
                        pendingUser.nic, // Mapping NIC field to Registration Number for shelters
                        'pending' // Default status for new shelters
                    ]
                );
            } else if (pendingUser.role === 'admin') {
                await connection.query(
                    'INSERT INTO admins (user_id, full_name, department) VALUES (?, ?, ?)',
                    [newUserId, pendingUser.name, 'General']
                );
            } else {
                // Default: Adopter
                await connection.query(
                    'INSERT INTO adopters (user_id, full_name, phone_number) VALUES (?, ?, ?)',
                    [newUserId, pendingUser.name, pendingUser.phone_number]
                );
            }

            // 6. Delete from Pending
            await connection.query('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);

            // Commit Transaction
            await connection.commit();

            // 7. Generate Token
            // We need to construct the payload carefully since we just inserted the data
            const payload = {
                user: {
                    id: newUserId,
                    email: pendingUser.email,
                    role: pendingUser.role,
                    // For convenience, add the name/shelter name to the token
                    name: pendingUser.name,
                    shelter_name: pendingUser.role === 'shelter' ? pendingUser.shelter_name : undefined,
                    verification_status: pendingUser.role === 'shelter' ? 'pending' : undefined
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'secret123',
                { expiresIn: '1d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        message: 'Email successfully verified',
                        token,
                        user: payload.user
                    });
                }
            );

        } catch (txErr) {
            // Rollback if any insert fails
            await connection.rollback();
            console.error("Transaction Error during verification:", txErr);
            throw txErr;
        }

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        // Always release the connection
        if (connection) connection.release();
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const pendingCheck = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
        if (pendingCheck.rows.length === 0) {
            // Check if already verified
            const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ error: "User already verified" });
            }
            return res.status(404).json({ error: "Verification record not found" });
        }

        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, otpSalt);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'UPDATE pending_users SET otp_hash = ?, otp_expires_at = ? WHERE email = ?',
            [otpHash, otpExpiresAt, email]
        );

        await emailService.sendOTP(email, otp);
        res.json({ success: true, message: "OTP resent" });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, requiredRole } = req.body;

        // 1. Check User in Base Table
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.rows.length === 0) {
            // Check pending
            const pending = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
            if (pending.rows.length > 0) {
                return res.status(403).json({
                    error: 'Please verify your email before logging in.',
                    requiresVerification: true,
                    email: email
                });
            }
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = users.rows[0];

        // 2. Validate Role
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
            const roleName = requiredRole === 'shelter' ? 'shelter' : 'user';
            return res.status(401).json({
                error: `This account is not registered as a ${roleName}. Please use the correct sign-in page.`
            });
        }

        // 3. Validate Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // 4. Fetch Profile Data (Because 'name' is no longer in 'users' table)
        let profileName = "User";
        let extraData = {};

        if (user.role === 'shelter') {
            const profileRes = await db.query('SELECT organization_name, verification_status FROM shelters WHERE user_id = ?', [user.id]);
            if (profileRes.rows.length > 0) {
                profileName = profileRes.rows[0].organization_name;
                extraData.shelter_name = profileRes.rows[0].organization_name;
                extraData.verification_status = profileRes.rows[0].verification_status;
            }
        } else if (user.role === 'admin') {
            const profileRes = await db.query('SELECT full_name FROM admins WHERE user_id = ?', [user.id]);
            if (profileRes.rows.length > 0) {
                profileName = profileRes.rows[0].full_name;
            }
        } else {
            // Adopter
            const profileRes = await db.query('SELECT full_name FROM adopters WHERE user_id = ?', [user.id]);
            if (profileRes.rows.length > 0) {
                profileName = profileRes.rows[0].full_name;
            }
        }

        // 5. Build Token
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: profileName,
                ...extraData
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ success: true, token, user: payload.user });
            }
        );
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Base User
        const userRes = await db.query('SELECT id, email, role, is_email_verified FROM users WHERE id = ?', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userRes.rows[0];

        let profile = {};

        // 2. Get Profile details from specific tables
        if (user.role === 'shelter') {
            const pRes = await db.query('SELECT organization_name, contact_number, verification_status, registration_number FROM shelters WHERE user_id = ?', [userId]);
            if (pRes.rows.length > 0) {
                const p = pRes.rows[0];
                profile = {
                    name: p.organization_name,
                    shelter_name: p.organization_name,
                    phone_number: p.contact_number,
                    verification_status: p.verification_status,
                    nic: p.registration_number // Return reg number as NIC for backward compatibility if needed
                };
            }
        } else if (user.role === 'admin') {
            const pRes = await db.query('SELECT full_name, department FROM admins WHERE user_id = ?', [userId]);
            if (pRes.rows.length > 0) {
                profile = { 
                    name: pRes.rows[0].full_name,
                    department: pRes.rows[0].department 
                };
            }
        } else {
            // Adopter
            const pRes = await db.query('SELECT full_name, phone_number, pawsonality_results FROM adopters WHERE user_id = ?', [userId]);
            if (pRes.rows.length > 0) {
                profile = {
                    name: pRes.rows[0].full_name,
                    phone_number: pRes.rows[0].phone_number,
                    pawsonality_results: pRes.rows[0].pawsonality_results
                };
            }
        }

        res.json({
            ...user,
            ...profile
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, phone_number } = req.body;
    const userId = req.user.id;

    try {
        const userRes = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const role = userRes.rows[0].role;

        // Update the specific table, NOT the users table
        if (role === 'shelter') {
            await db.query(
                'UPDATE shelters SET organization_name = COALESCE(?, organization_name), contact_number = COALESCE(?, contact_number) WHERE user_id = ?',
                [name, phone_number, userId]
            );
        } else if (role === 'admin') {
            await db.query(
                'UPDATE admins SET full_name = COALESCE(?, full_name) WHERE user_id = ?',
                [name, userId]
            );
        } else {
            // Adopter
            await db.query(
                'UPDATE adopters SET full_name = COALESCE(?, full_name), phone_number = COALESCE(?, phone_number) WHERE user_id = ?',
                [name, phone_number, userId]
            );
        }

        await logActivity(userId, 'PROFILE_UPDATE', { name, phone_number });
        res.json({ success: true, message: 'Profile updated' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ... Keep forgotPassword, resetPassword, updatePassword, updateNotifications, deleteAccount, getActivityLogs as is ...
// (These usually work on the 'users' table or separate logs table which are largely unchanged, 
// unless deleteAccount needs to cascade delete manually if you didn't set ON DELETE CASCADE in SQL)
