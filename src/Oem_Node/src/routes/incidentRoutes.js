const express = require('express');
const router = express.Router();
const controller = require('../controllers/incidentController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator'); 

// --- INCIDENT TYPES ---
router.get('/types/all', auth, controller.getAllTypes);
router.post('/types', auth, controller.createType);

router.get('/types/:id', auth, controller.getTypeById); 

router.put('/types/:id', auth, controller.updateType);
router.delete('/types/:id', auth, controller.deleteType);


// --- INCIDENTS ---
router.get('/Search', auth, controller.search);
router.get('/:id', auth, controller.getIncidentById);
router.post('/', auth, controller.createIncident);
router.put('/:id', auth, controller.updateIncident);
router.delete('/:id', auth, controller.deleteIncident);

module.exports = router;