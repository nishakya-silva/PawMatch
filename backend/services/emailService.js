const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
});

exports.sendOTP = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: '"PawMatch" <no-reply@pawmatch.com>',
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

        // For development/testing (if using Ethereal)
        /* 
           If you strictly need to see the link in the console, 
           nodemailer.getTestMessageUrl(info) works with Ethereal accounts automatically created,
           but here we are using env vars. 
        */

        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
