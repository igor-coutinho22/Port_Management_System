const express = require('express');
const router = express.Router();
const controller = require('../controllers/vesselVisitExecutionController');
const requireAuth = require('../middleware/authMiddleware');

// Matches [Authorize("RequireOperator")]
// Note: In C#, RequireOperator allowed (Operator OR Admin). Our middleware logic handles that check.
router.get('/GetAll', requireAuth('RequireOperator'), controller.getAll);
router.post('/Create', requireAuth('RequireOperator'), controller.create);
router.get('/:id', requireAuth('RequireOperator'), controller.getById);
router.delete('/:id', requireAuth('RequireOperator'), controller.delete);

module.exports = router;