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
        const { name, email, password, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];

            // Optional: If user exists but is NOT verified, resend OTP?
            // For now, consistent with prompt "Prevent duplicate accounts"
            if (existingUser.is_verified) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // If they are not verified, we could overwrite/update, 
            // but let's stick to standard error for now unless specifically asked to handle "resend" logic here.
            // Actually, for a better UX, if I sign up and fail to verify, I might try to sign up again.
            // Let's allow updating the pending user.

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
                'UPDATE users SET name = ?, password_hash = ?, phone_number = ?, otp_hash = ?, otp_expires_at = ? WHERE email = ?',
                [name, hashedPassword, phone || null, otpHash, otpExpiresAt, email]
            );

            // Send OTP
            await emailService.sendOTP(email, otp);

            // Log for dev purposes (in case email fails locally)
            console.log(`DEV ONLY: OTP for ${email} is ${otp}`);

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
            'INSERT INTO users (name, email, password_hash, phone_number, is_verified, otp_hash, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, false, otpHash, otpExpiresAt]
        );

        await emailService.sendOTP(email, otp);
        console.log(`DEV ONLY: OTP for ${email} is ${otp}`);

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
                name: user.name
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
