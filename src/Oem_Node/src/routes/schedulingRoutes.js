const express = require('express');
const router = express.Router();
const controller = require('../controllers/schedulingController');
const requireAuth = require('../middleware/authMiddleware');

router.post('/daily', requireAuth('RequireOperator'), controller.generateDailySchedule);
router.post('/daily-with-multi-crane', requireAuth('RequireOperator'), controller.generateDailyScheduleWithMultiCrane);

module.exports = router;