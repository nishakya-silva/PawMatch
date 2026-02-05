const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const welfareController = require('../controllers/welfareController');
const verifyController = require('../controllers/verifyController');
const adoptionController = require('../controllers/adoptionController');
const authController = require('../controllers/authController');
const alertService = require('../services/alertService');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Match Routes
router.post('/match', matchController.getMatches);

// Adoption Routes
router.post('/adopt', adoptionController.applyForAdoption);

// Welfare Routes
router.get('/welfare/:adoptionId', welfareController.getDashboard);
router.post('/welfare/:adoptionId/log', welfareController.postLog);

// Verification Route
router.post('/verify', verifyController.verifyIdentity);

// Alert Test Route
router.post('/alerts/test', async (req, res) => {
    const { phone, message } = req.body;
    const result = await alertService.sendAlert(phone, message);
    res.json(result);
});

module.exports = router;
