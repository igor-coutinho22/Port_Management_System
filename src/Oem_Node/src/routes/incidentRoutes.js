const express = require('express');
const router = express.Router();
const controller = require('../controllers/incidentController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator');

// Search
router.get('/Search', auth, controller.search);

// Incidents CRUD
router.get('/:id', auth, controller.getIncidentById);
router.post('/', auth, controller.createIncident);
router.put('/:id', auth, controller.updateIncident);
router.delete('/:id', auth, controller.deleteIncident);

// Incident Types CRUD (Nested or separate? Routes are flexible)
// Map to /api/incidents/types/...
router.get('/types/all', auth, controller.getAllTypes);
router.post('/types', auth, controller.createType);
router.put('/types/:id', auth, controller.updateType);
router.delete('/types/:id', auth, controller.deleteType);

module.exports = router;
