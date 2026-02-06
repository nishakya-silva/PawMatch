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
        if (!email || !password || !name || !nic) {
            return res.status(400).json({ error: 'Please enter all required fields including NIC' });
        }

        // 2. NIC Validation (MOVED UP: This must happen before using cleanNic)
        const nicValidation = nicValidator(nic);
        if (!nicValidation.valid) {
            return res.status(400).json({ error: `Invalid NIC: ${nicValidation.error}` });
        }
        const cleanNic = nicValidation.nic;

        const userRole = role === 'shelter' ? 'shelter' : 'adopter';

        // 3. Check if user exists in main table
        const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];

            if (existingUser.is_verified) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // --- Existing Unverified User Logic ---
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const otp = generateOTP();
            const otpSalt = await bcrypt.genSalt(10);
            const otpHash = await bcrypt.hash(otp, otpSalt);
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Now cleanNic is defined and safe to use here
            await db.query(
                'UPDATE users SET name = ?, password_hash = ?, phone_number = ?, nic = ?, role = ?, shelter_name = ?, otp_hash = ?, otp_expires_at = ? WHERE email = ?',
                [name, hashedPassword, phone || null, cleanNic, userRole, shelter_name || null, otpHash, otpExpiresAt, email]
            );

            await emailService.sendOTP(email, otp);

            return res.status(200).json({
                success: true,
                message: 'Registration successful. Please verify your email.',
                requiresVerification: true,
                email: email
            });
        }

        // --- New User Logic ---

        // 4. Check if NIC already exists in main table
        const nicCheckMain = await db.query('SELECT * FROM users WHERE nic = ?', [cleanNic]);
        if (nicCheckMain.rows.length > 0) {
            return res.status(400).json({ error: 'This NIC is already registered' });
        }

        // 5. Hash Password & Generate OTP
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, otpSalt);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 6. Check Pending Users
        const pendingCheck = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);

        if (pendingCheck.rows.length > 0) {
            // Update existing pending record
            try {
                await db.query(
                    'UPDATE pending_users SET name = ?, password_hash = ?, phone_number = ?, nic = ?, otp_hash = ?, otp_expires_at = ? WHERE email = ?',
                    [name, hashedPassword, phone || null, cleanNic, otpHash, otpExpiresAt, email]
                );
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'This NIC is already being used in a pending registration' });
                }
                throw err;
            }
        } else {
            // Check if NIC is in another pending record
            const nicCheckPending = await db.query('SELECT * FROM pending_users WHERE nic = ?', [cleanNic]);
            if (nicCheckPending.rows.length > 0) {
                return res.status(400).json({ error: 'This NIC is already being used in a pending registration' });
            }

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
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Find user in pending_users
        const pendingUsers = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
        if (pendingUsers.rows.length === 0) {
            return res.status(400).json({ error: 'Verification record not found or already verified' });
        }

        const pendingUser = pendingUsers.rows[0];

        // Check expiration
        if (new Date() > new Date(pendingUser.otp_expires_at)) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, pendingUser.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Move to users table
        const insertRes = await db.query(
            'INSERT INTO users (name, email, password_hash, phone_number, nic, is_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
            [pendingUser.name, pendingUser.email, pendingUser.password_hash, pendingUser.phone_number, pendingUser.nic]
        );

        // Get the new user ID (mysql specific structure from our db wrapper)
        const userId = insertRes.rows.insertId;

        // Delete from pending
        await db.query('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);

        // Generate token for auto-login
        const payload = {
            user: {
                id: userId,
                email: pendingUser.email,
                name: pendingUser.name,
                nic: pendingUser.nic
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

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const pendingCheck = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
        if (pendingCheck.rows.length === 0) {
            // Check if already verified in users table
            const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ error: "User already verified" });
            }
            return res.status(404).json({ error: "Verification record not found" });
        }

        // Generate new OTP
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
        const { email, password } = req.body;

        // Check for user
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.rows.length === 0) {
            // Check if it's a pending account
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

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT (The is_verified check is no longer needed if we only keep verified users in the main table)
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                shelter_name: user.shelter_name,
                verification_status: user.verification_status,
                nic: user.nic
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

// Forgot Password - Initiate
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(resetToken, 10);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token hash
        await db.query(
            'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE email = ?',
            [tokenHash, expiresAt, email]
        );

        // Send Link (Construct full URL based on frontend origin. Assuming localhost:3000 for dev)
        // In prod, use environment variable for FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        await emailService.sendPasswordReset(email, resetLink);

        res.json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Reset Password - Complete
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = users.rows[0];

        // Check if token expired
        if (!user.reset_token_expires_at || new Date() > new Date(user.reset_token_expires_at)) {
            return res.status(400).json({ error: "Reset link has expired" });
        }

        // Verify token
        // Note: bcrypt checks hash. We store hash in DB.
        const isMatch = await bcrypt.compare(token, user.reset_token_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid reset token" });
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Get current user details
exports.getMe = async (req, res) => {
    try {
        const user = await db.query('SELECT id, name, email, phone_number, nic, email_notifications, sms_alerts FROM users WHERE id = ?', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const { name, phone_number } = req.body;

    try {
        const user = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.query(
            'UPDATE users SET name = ?, phone_number = ? WHERE id = ?',
            [name || user.rows[0].name, phone_number || user.rows[0].phone_number, req.user.id]
        );

        // Log activity
        await logActivity(req.user.id, 'PROFILE_UPDATE', { name, phone_number });

        const updatedUser = await db.query('SELECT id, name, email, phone_number, nic FROM users WHERE id = ?', [req.user.id]);

        res.json({ success: true, user: updatedUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = users.rows[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        // Log activity
        await logActivity(req.user.id, 'PASSWORD_CHANGE');

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update Notifications
exports.updateNotifications = async (req, res) => {
    const { email_notifications, sms_alerts } = req.body;

    try {
        await db.query(
            'UPDATE users SET email_notifications = ?, sms_alerts = ? WHERE id = ?',
            [email_notifications, sms_alerts, req.user.id]
        );

        res.json({ success: true, message: 'Notification preferences updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        // First, check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user's adoptions first (foreign key constraints)
        // If there are other related tables, delete from them too
        await db.query('DELETE FROM adoptions WHERE user_id = ?', [req.user.id]);

        // Finally delete user
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get User Activity Logs
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await db.query(
            'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json({ success: true, logs: logs.rows });
    } catch (err) {
        console.error("Fetch Activity Logs Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};