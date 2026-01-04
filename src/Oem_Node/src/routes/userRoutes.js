const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/authMiddleware'); 

// All routes here require a valid Login Token
router.use(requireAuth()); 

// 1. Get Current User Status (Polls for Privacy Check)
router.get('/privacy-status', userController.getPrivacyStatus);

// 2. Accept the Policy
router.post('/accept-privacy', userController.acceptPrivacyPolicy);
router.get('/me/export', userController.exportUserData);

module.exports = router;