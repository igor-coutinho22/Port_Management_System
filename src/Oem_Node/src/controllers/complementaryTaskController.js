const service = require('../models/application/services/complementaryTaskService');

// --- CATEGORIES (US 4.1.14) ---

exports.getAllCategories = async (req, res) => {
    try {
        const result = await service.getAllCategories();
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.getCategoryById = async (req, res) => {
    try {
        const result = await service.getCategoryById(req.params.id);
        if (!result) return res.status(404).send("Category not found.");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.createCategory = async (req, res) => {
    try {
        const result = await service.createCategory(req.body);
        res.status(201).json(result);
    } catch (err) { 
        if (err.message.includes('duplicate')) return res.status(409).send("Category Code must be unique.");
        res.status(400).send(err.message); 
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const result = await service.updateCategory(req.params.id, req.body);
        if (!result) return res.status(404).send("Category not found.");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteCategory = async (req, res) => {
    try {
        const result = await service.deleteCategory(req.params.id);
        if (!result) return res.status(404).send("Category not found.");
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

// --- TASKS (US 4.1.15) ---

exports.search = async (req, res) => {
    try {
        const filters = {
            start: req.query.start,
            end: req.query.end,
            status: req.query.status,
            vesselVisitId: req.query.vesselVisitId,
            vessel: req.query.vessel
        };
        const results = await service.searchTasks(filters);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const result = await service.getTaskById(req.params.id);
        if (!result) return res.status(404).send("Task not found");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.createTask = async (req, res) => {
    try {
        const result = await service.createTask(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateTask = async (req, res) => {
    try {
        const result = await service.updateTask(req.params.id, req.body);
        if (!result) return res.status(404).send("Task not found");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteTask = async (req, res) => {
    try {
        const result = await service.deleteTask(req.params.id);
        if (!result) return res.status(404).send("Task not found");
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};