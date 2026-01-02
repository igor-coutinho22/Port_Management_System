const service = require('../models/application/services/incidentService');

// --- Incident Types ---
exports.getAllTypes = async (req, res) => {
    try {
        const result = await service.getAllTypes();
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.createType = async (req, res) => {
    try {
        const result = await service.createType(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateType = async (req, res) => {
    try {
        const result = await service.updateType(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteType = async (req, res) => {
    try {
        await service.deleteType(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

// --- Incidents ---
exports.createIncident = async (req, res) => {
    try {
        const result = await service.createIncident(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateIncident = async (req, res) => {
    try {
        const result = await service.updateIncident(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteIncident = async (req, res) => {
    try {
        await service.deleteIncident(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

exports.getIncidentById = async (req, res) => {
    try {
        const result = await service.getIncidentById(req.params.id);
        if (!result) return res.status(404).send("Incident not found");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.search = async (req, res) => {
    try {
        const filters = {
            start: req.query.start,
            end: req.query.end,
            status: req.query.status,
            severity: req.query.severity,
            vessel: req.query.vessel
        };
        const results = await service.searchIncidents(filters);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
