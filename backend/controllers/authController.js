const crypto = require('crypto');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Helper to generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role, shelter_name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        const userRole = role === 'shelter' ? 'shelter' : 'adopter';

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];

            if (existingUser.is_verified) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Generate OTP
            const otp = generateOTP();
            const otpSalt = await bcrypt.genSalt(10);
            const otpHash = await bcrypt.hash(otp, otpSalt);
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Update existing unverified user
            await db.query(
                'UPDATE users SET name = ?, password_hash = ?, phone_number = ?, role = ?, shelter_name = ?, otp_hash = ?, otp_expires_at = ? WHERE email = ?',
                [name, hashedPassword, phone || null, userRole, shelter_name || null, otpHash, otpExpiresAt, email]
            );

            // Send OTP
            await emailService.sendOTP(email, otp);

            return res.status(200).json({
                success: true,
                message: 'Registration successful. Please verify your email.',
                requiresVerification: true,
                email: email
            });
        }

        // New User Logic
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, otpSalt);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.query(
            'INSERT INTO users (name, email, password_hash, phone_number, role, shelter_name, is_verified, otp_hash, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, userRole, shelter_name || null, false, otpHash, otpExpiresAt]
        );

        await emailService.sendOTP(email, otp);

        res.status(201).json({
            success: true,
            message: 'User registered. Please check your email for verification code.',
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

        // Find user
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = users.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        // Check expiration
        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Setup verified
        await db.query(
            'UPDATE users SET is_verified = TRUE, otp_hash = NULL, otp_expires_at = NULL WHERE id = ?',
            [user.id]
        );

        // Generate token for auto-login
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
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

        const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userCheck.rows[0];
        if (user.is_verified) {
            return res.status(400).json({ error: "User already verified" });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, otpSalt);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'UPDATE users SET otp_hash = ?, otp_expires_at = ? WHERE email = ?',
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
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = users.rows[0];

        // Check verification status
        if (!user.is_verified) {
            return res.status(403).json({
                error: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                shelter_name: user.shelter_name,
                verification_status: user.verification_status
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
