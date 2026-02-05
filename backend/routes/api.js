const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const welfareController = require('../controllers/welfareController');
const verifyController = require('../controllers/verifyController');
const adoptionController = require('../controllers/adoptionController');
const authController = require('../controllers/authController');
const alertService = require('../services/alertService');

const auth = require('../middleware/auth');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/update-password', auth, authController.updatePassword);
router.put('/notifications', auth, authController.updateNotifications);
router.delete('/account', auth, authController.deleteAccount);
router.get('/logs', auth, authController.getActivityLogs);

// Match Routes
router.post('/match', matchController.getMatches);

// Adoption Routes
router.post('/adopt', adoptionController.applyForAdoption);
router.get('/adoptions/me', auth, adoptionController.getUserAdoptions);

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

// Pet Routes
const petController = require('../controllers/petController');
router.post('/pets', petController.uploadMiddleware, petController.addPet);
router.get('/pets', petController.getAllPets);
router.get('/pets/:id', petController.getPetById);

// Visit Routes
const visitController = require('../controllers/visitController');
router.post('/visits', auth, visitController.scheduleVisit);
router.get('/visits', auth, visitController.getUserVisits);
router.put('/visits/:id', auth, visitController.updateVisit);
router.delete('/visits/:id', auth, visitController.cancelVisit);

// Shelter Routes (Dashboard Snippets)
const shelterController = require('../controllers/shelterController');
router.get('/shelter/:shelterId/visits', shelterController.getVisitRequests);
router.put('/shelter/visits/:visitId', shelterController.updateVisitStatus);

module.exports = router;
