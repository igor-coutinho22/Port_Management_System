const express = require('express');
const router = express.Router();
// Ensure this path points to the file you just edited
const privacyController = require('../controllers/privacyPolicyController'); 
const requireAuth = require('../middleware/authMiddleware');

// --- US 4.5.4 (The Public Route) ---
// This connects GET /api/privacy/latest -> controller.getLatestPolicy
router.get('/latest', privacyController.getLatestPolicy);

// --- PROTECTED ROUTES (Admin Only) ---
router.use(requireAuth()); 

// --- US 4.5.1 (Publish) ---
// This connects POST /api/privacy -> controller.publishPolicy
router.post('/', privacyController.publishPolicy);

// --- US 4.5.2 (History) ---
// This connects GET /api/privacy/history -> controller.getPolicyHistory
router.get('/history', privacyController.getPolicyHistory);

module.exports = router;