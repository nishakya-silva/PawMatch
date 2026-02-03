const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

exports.sendAlert = async (to, message) => {
    if (!client) {
        console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
        return { success: true, mocked: true };
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: to
        });
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error("Twilio Error:", error);
        return { success: false, error: error.message };
    }
};
