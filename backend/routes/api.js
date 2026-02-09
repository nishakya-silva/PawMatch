const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const welfareController = require('../controllers/welfareController');
const verifyController = require('../controllers/verifyController');
const adoptionController = require('../controllers/adoptionController');
const authController = require('../controllers/authController');
const alertService = require('../services/alertService');
const analyticsController = require('../controllers/analyticsController');
const achievementController = require('../controllers/achievementController');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/validate-nic', authController.validateNIC);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/update-password', auth, authController.updatePassword);
router.put('/notifications', auth, authController.updateNotifications);
router.put('/notifications/read', auth, authController.markNotificationsRead);
router.delete('/account', auth, authController.deleteAccount);
router.get('/logs', auth, authController.getActivityLogs);
router.get('/achievements', auth, achievementController.getUserAchievements);

// Match Routes
router.post('/match', matchController.getMatches);

// Adoption Routes
router.post('/adopt', auth, adoptionController.applyForAdoption);
router.get('/adoptions/me', auth, adoptionController.getUserAdoptions);
router.get('/shelter/applications', auth, adoptionController.getShelterApplications);
router.post('/shelter/approve-adoption', auth, adoptionController.approveAdoption);

// Welfare Routes
router.get('/welfare/shelter/alerts', auth, welfareController.getShelterAlerts);
router.post('/welfare/respond', auth, welfareController.respondToAlert);
router.get('/welfare/:adoptionId', auth, welfareController.getDashboard);
router.post('/welfare/:adoptionId/log', auth, welfareController.postLog);

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
router.put('/pets/:id', petController.uploadMiddleware, petController.updatePet);

// Demo Routes
const demoController = require('../controllers/demoController');
router.post('/demo/request', demoController.requestDemo);
router.get('/demo/requests', demoController.getDemoRequests); // For admin dashboard

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
router.post('/shelter/message', auth, shelterController.sendMessage);
router.get('/shelter/messages', auth, shelterController.getShelterMessages);
router.post('/shelter/message/respond', auth, shelterController.respondToMessage);
router.get('/shelter/potential-matches', auth, shelterController.getPotentialMatches);
router.get('/user/messages', auth, shelterController.getUserMessages);
router.get('/shelter/pets', auth, shelterController.getShelterPets);
router.get('/shelter/public/:id', shelterController.getShelterPublicProfile);

// Report Routes
const reportController = require('../controllers/reportController');
router.post('/reports', reportController.submitReport);
router.get('/reports', reportController.getRecentReports);
router.delete('/reports/:id', reportController.deleteReport);

// Admin / Shelter Verification Routes
const adminController = require('../controllers/adminController');
router.post('/shelters/verify-request', adminController.uploadVerificationDoc, adminController.submitVerification);
router.get('/admin/pending-shelters', [auth, admin], adminController.getPendingShelters);
router.post('/admin/verify-shelter', [auth, admin], adminController.verifyShelter);
router.get('/admin/stats', [auth, admin], adminController.getStats);
router.get('/admin/all-shelters', [auth, admin], adminController.getAllShelters);
router.get('/admin/alerts', [auth, admin], adminController.getAlerts);
router.post('/admin/handle-report', [auth, admin], adminController.handleAnimalReport);
router.post('/admin/handle-welfare', [auth, admin], adminController.handleWelfareAlert);
router.get('/admin/all-adoptions', [auth, admin], adminController.getAdoptions);
router.get('/admin/analytics/shelter/:id', [auth, admin], analyticsController.getShelterAnalytics);

module.exports = router;
