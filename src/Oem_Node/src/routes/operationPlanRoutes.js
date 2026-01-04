const express = require('express');
const router = express.Router();
const controller = require('../controllers/operationPlanController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator');

// --- SPECIFIC ROUTES FIRST ---
router.post('/', auth, controller.savePlan);
router.get('/Search', auth, controller.searchPlans);
router.get('/GetAll', auth, controller.getAllPlans);
router.get('/resource-utilization', auth, controller.getResourceUtilization);
router.post('/regenerate', auth, controller.regeneratePlan);

// Move Approve/Reject ABOVE the generic /:id route
router.put('/approve', auth, controller.approvePlan);
router.put('/reject', auth, controller.rejectPlan);

// Move GetMissingPlans ABOVE /:id (just to be safe, though GET vs PUT helps)
router.get('/missing-plans/:date', auth, controller.getMissingPlans);

// --- GENERIC ROUTES LAST ---
// These capture anything that looks like an ID
router.get('/GetById/:id', auth, controller.getPlanById);
router.delete('/:id', auth, controller.deletePlan);
router.put('/:id', auth, controller.updatePlan);

module.exports = router;