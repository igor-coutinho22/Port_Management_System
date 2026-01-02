const express = require('express');
const router = express.Router();
const controller = require('../controllers/complementaryTaskController');
const requireAuth = require('../middleware/authMiddleware');

const auth = requireAuth('RequireOperator'); // Assuming same auth level as Incidents

// Search
router.get('/Search', auth, controller.search);

// Categories
// /api/complementarytasks/categories
router.get('/categories/all', auth, controller.getAllCategories);
router.post('/categories', auth, controller.createCategory);
router.put('/categories/:id', auth, controller.updateCategory);
router.delete('/categories/:id', auth, controller.deleteCategory);

// Tasks
// /api/complementarytasks
router.get('/:id', auth, controller.getTaskById);
router.post('/', auth, controller.createTask);
router.put('/:id', auth, controller.updateTask);
router.delete('/:id', auth, controller.deleteTask);

module.exports = router;
