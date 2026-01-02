const service = require('../models/application/services/incidentService');

// @desc    Search Incidents with Advanced Filtering
// @route   GET /api/incidents/Search
exports.search = async (req, res) => {
    try {
        const filters = {
            start: req.query.start,
            end: req.query.end,
            status: req.query.status,
            severity: req.query.severity,
            vessel: req.query.vessel
        };

        const token = req.headers.authorization;
        const results = await service.searchIncidents(filters, token);

        res.status(200).json(results);
    } catch (err) {
        console.error("Incident Search Error:", err.message);
        res.status(500).send(err.message);
    }
};
