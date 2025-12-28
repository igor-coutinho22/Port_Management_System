const express = require('express');
const router = express.Router();
const controller = require('../controllers/vesselVisitExecutionController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator');

router.get('/GetAll', auth, controller.getAll);
router.post('/Create', auth, controller.create);
router.get('/:id', auth, controller.getById);

router.put('/:id', auth, controller.update);

router.delete('/:id', auth, controller.delete);

module.exports = router;