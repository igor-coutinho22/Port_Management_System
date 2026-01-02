const express = require('express');
const router = express.Router();
const controller = require('../controllers/incidentController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator');

router.get('/Search', auth, controller.search);

module.exports = router;
