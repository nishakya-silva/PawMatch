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
    console.warn("⚠️ SMTP Config missing. Emails will NOT be sent (OTPs logged to console).");
}

exports.sendOTP = async (email, otp) => {
    console.log(`\n==================================================`);
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`==================================================\n`);

    if (!isSMTPConfigured) {
        console.log("ℹ️ Skipping email send (no SMTP config).");
        return true;
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
        console.error("❌ Error sending email:", error.message);

        // Help user debug Gmail issues
        if (error.responseCode === 535) {
            console.error("\n💡 GMAIL TIP: You probably need an App Password.");
            console.error("   1. Enable 2-Step Verification in your Google Account.");
            console.error("   2. Go to https://myaccount.google.com/apppasswords");
            console.error("   3. Generate an 'App Password' (select 'Mail' and 'Mac' or custom name).");
            console.error("   4. Use that 16-character code as your SMTP_PASS in .env.");
        }
        return false;
    }
};

exports.sendPasswordReset = async (email, resetAppUrl) => {
    console.log(`\n==================================================`);
    console.log(`🔑 Reset Link for ${email}: ${resetAppUrl}`);
    console.log(`==================================================\n`);

    if (!isSMTPConfigured) {
        return true; // Pretend success
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'PawMatch'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: "Reset Your Password - PawMatch",
            text: `You requested a password reset. Please use the following link: ${resetAppUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Reset Your Password</h2>
                    <p>You requested a password reset for your PawMatch account.</p>
                    <p>Click the button below to reset it:</p>
                    <a href="${resetAppUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        if (error.responseCode === 535) {
            console.error("\n💡 GMAIL TIP: You probably need an App Password.");
            console.error("   1. Enable 2-Step Verification in your Google Account.");
            console.error("   2. Go to https://myaccount.google.com/apppasswords");
            console.error("   3. Generate an 'App Password'.");
            console.error("   4. Use that 16-character code as your SMTP_PASS in .env.");
        }
        return false;
    }
};
