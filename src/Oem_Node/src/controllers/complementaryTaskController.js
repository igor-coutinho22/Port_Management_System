const service = require('../models/application/services/complementaryTaskService');

// --- Categories ---
exports.getAllCategories = async (req, res) => {
    try {
        const result = await service.getAllCategories();
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.createCategory = async (req, res) => {
    try {
        const result = await service.createCategory(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateCategory = async (req, res) => {
    try {
        const result = await service.updateCategory(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteCategory = async (req, res) => {
    try {
        await service.deleteCategory(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

// --- Tasks ---
exports.createTask = async (req, res) => {
    try {
        const result = await service.createTask(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateTask = async (req, res) => {
    try {
        const result = await service.updateTask(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteTask = async (req, res) => {
    try {
        await service.deleteTask(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

exports.getTaskById = async (req, res) => {
    try {
        const result = await service.getTaskById(req.params.id);
        if (!result) return res.status(404).send("Task not found");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.search = async (req, res) => {
    try {
        const filters = {
            start: req.query.start,
            end: req.query.end,
            status: req.query.status,
            vesselVisitId: req.query.vesselVisitId,
            vessel: req.query.vessel // Vessel Name or IMO
        };
        const results = await service.searchTasks(filters);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
