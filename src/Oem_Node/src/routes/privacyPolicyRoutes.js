const express = require('express');
const router = express.Router();
const controller = require('../controllers/privacyPolicyController');

// IMPORT YOUR MIDDLEWARE
const requireAuth = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
// The footer needs this to be accessible to everyone (even without a token)
router.get('/latest', controller.getLatest);

// --- PROTECTED ROUTES (Admin Only) ---
// 1. Get History (Audit logs are for admins only)
// 2. Publish New (Only admins can write new policies)
router.get('/history', requireAuth('Admin'), controller.getHistory);
router.post('/', requireAuth('Admin'), controller.create);

module.exports = router;