const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if SMTP credentials are provided
const isSMTPConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter = null;

if (isSMTPConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} else {
    console.warn("⚠️ SMTP Config missing. Emails will NOT be sent. OTPs will be logged to console.");
}

exports.sendOTP = async (email, otp) => {
    // Always log for development so you aren't stuck if email fails
    console.log(`\n==================================================`);
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`==================================================\n`);

    if (!isSMTPConfigured) {
        console.log("ℹ️ Skipping email send (no SMTP config).");
        return true; // Return true so the flow continues smoothly for testing
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'PawMatch'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your Account - PawMatch",
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Verify Your Account</h2>
                    <p>Thank you for signing up with PawMatch!</p>
                    <p>Please use the following 6-digit code to complete your registration:</p>
                    <h1 style="letter-spacing: 5px; background: #f3f4f6; padding: 10px 20px; display: inline-block; border-radius: 8px;">${otp}</h1>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        // We return false here to indicate email failure, but depending on requirements we might want to let the user proceed if we logged it.
        // For now, let's allow it to 'fail' essentially, but since we logged the OTP, the developer can still proceed.
        return false;
    }
};
