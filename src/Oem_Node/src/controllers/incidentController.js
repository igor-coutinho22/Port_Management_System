const service = require('../models/application/services/incidentService');

// --- INCIDENT TYPES ---

exports.getAllTypes = async (req, res) => {
    try {
        const result = await service.getAllTypes();
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.getTypeById = async (req, res) => {
    try {
        const result = await service.getTypeById(req.params.id);
        if (!result) return res.status(404).send("Incident Type not found.");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.createType = async (req, res) => {
    try {
        const result = await service.createType(req.body);
        res.status(201).json(result);
    } catch (err) { 
        // Handle duplicate code error (MongoDB E11000)
        if (err.message.includes('duplicate') || err.code === 11000) {
            return res.status(409).send("An Incident Type with this code already exists.");
        }
        res.status(400).send(err.message); 
    }
};

exports.updateType = async (req, res) => {
    try {
        const result = await service.updateType(req.params.id, req.body);
        if (!result) return res.status(404).send("Incident Type not found.");
        res.status(200).json(result);
    } catch (err) { res.status(500).send(err.message); }
};

exports.deleteType = async (req, res) => {
    try {
        const result = await service.deleteType(req.params.id);
        if (!result) return res.status(404).send("Incident Type not found.");
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

// --- INCIDENTS ---

exports.createIncident = async (req, res) => {
    try {
        // FIX: Pass 'req.user' to capture the Author
        const user = req.user || { name: 'Unknown' }; 
        const result = await service.createIncident(req.body, user);
        
        res.status(201).json(result);
    } catch (err) { res.status(400).send(err.message); }
};

exports.updateIncident = async (req, res) => {
    try {
        const user = req.user || { name: 'Unknown' };

        // 1. GET the current version from the database first
        const existingIncident = await service.getIncidentById(req.params.id);

        // 2. Check if it exists
        if (!existingIncident) {
            return res.status(404).send("Incident not found.");
        }

        // 3. Check the CURRENT status in the database
        if (existingIncident.status === 'Resolved') {
            return res.status(400).send("Operation denied: This incident is already Resolved and cannot be modified.");
        }

        // 4. If active, proceed with the update
        const result = await service.updateIncident(req.params.id, req.body, user);
        
        res.status(200).json(result);
    } catch (err) { 
        res.status(500).send(err.message); 
    }
};

exports.deleteIncident = async (req, res) => {
    try {
        const result = await service.deleteIncident(req.params.id);
        if (!result) return res.status(404).send("Incident not found.");
        res.status(204).send();
    } catch (err) { res.status(500).send(err.message); }
};

exports.getIncidentById = async (req, res) => {
    try {
        const result = await service.getIncidentById(req.params.id);
        if (!result) return res.status(404).send("Incident not found.");
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