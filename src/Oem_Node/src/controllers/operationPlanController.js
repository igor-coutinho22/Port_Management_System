const service = require('../models/application/services/operationPlanService');
const webAppService = require('../models/infrastructure/integration/webAppService');
const OperationPlanMapper = require('../models/application/mappers/operationPlanMapper');
const { CreateOperationPlanDTO, UpdateOperationPlanDTO } = require('../models/application/dtos/operationPlanDTOs');

// @route   POST /api/operationplan
exports.savePlan = async (req, res) => {
    console.log(`--> [CONTROLLER] 1. Request Received for ${req.body.scheduleDate}`);

    try {
        const token = req.headers.authorization;
        const request = new CreateOperationPlanDTO(req.body);

        // 1. Fetch Visits
        let visits = await webAppService.getApprovedVisitsForDate(request.scheduleDate, token);
        if (!visits) visits = [];

        // 2. Map Visits (Dictionary for O(1) access)
        const visitMap = {};
        visits.forEach(v => visitMap[v.id] = v);

        // 3. Map to Domain
        // Determine author: User from token (middleware) or 'System'
        const author = req.user ? req.user.name : 'System';
        request.author = author;

        const domainPlan = OperationPlanMapper.toDomain(request, visitMap);

        // 4. Save
        await service.savePlan(domainPlan);

        // 5. Return Created DTO
        const createdDto = OperationPlanMapper.toDTO(domainPlan);
        
        // Matches: CreatedAtAction(nameof(GetPlanById), ...)
        return res.status(201).json(createdDto);

    } catch (ex) {
        console.error(`--> [CONTROLLER ERROR] ${ex.message}`);
        console.error(ex.stack);
        return res.status(500).json({ message: "Backend Error: " + ex.message });
    }
};

// @route   GET /api/operationplan/Search
exports.searchPlans = async (req, res) => {
    try {
        const { startDate, endDate, vesselIMO } = req.query;
        const token = req.headers.authorization;

        if (!startDate && !endDate && !vesselIMO) {
            return res.status(400).send("At least one search parameter (date(s) or vesselIMO) must be provided.");
        }

        if (vesselIMO) {
            const isValidVessel = await webAppService.isVesselValid(vesselIMO, token);
            if (!isValidVessel) {
                return res.status(400).send(`Vessel with IMO ${vesselIMO} is not valid (or WebApp service is unreachable).`);
            }
        }

        const plans = await service.searchPlans(startDate, endDate, vesselIMO);

        if (!plans || plans.length === 0) {
            return res.status(404).send("No operation plans found matching the criteria.");
        }

        const dtos = plans.map(p => OperationPlanMapper.toDTO(p));
        return res.status(200).json(dtos);

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   GET /api/operationplan/GetById/:id
exports.getPlanById = async (req, res) => {
    try {
        const plan = await service.getPlanById(req.params.id);
        if (!plan) {
            return res.status(404).send(`No operation plan found for ID ${req.params.id}`);
        }
        return res.status(200).json(OperationPlanMapper.toDTO(plan));
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   GET /api/operationplan/GetAll
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await service.getAllPlans();
        const dtos = plans.map(p => OperationPlanMapper.toDTO(p));
        return res.status(200).json(dtos);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   DELETE /api/operationplan/:id
exports.deletePlan = async (req, res) => {
    try {
        await service.deletePlan(req.params.id);
        return res.status(204).send(); // NoContent
    } catch (err) {
        console.error(`--> [CONTROLLER ERROR] ${err.message}`);
        // Handle specific "Not Found" error vs others
        if (err.message.includes('not exist') || err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

// @route   PUT /api/operationplan/:id
exports.updatePlan = async (req, res) => {
    try {
        if (!req.body) return res.status(400).send("Request body cannot be empty.");

        const dto = new UpdateOperationPlanDTO(req.body);
        const id = req.params.id;

        // Set author
        if (!dto.author) dto.author = req.user ? req.user.name : "System";

        const updatedPlan = await service.updatePlan(id, dto);
        
        return res.status(200).json(OperationPlanMapper.toDTO(updatedPlan));

    } catch (err) {
        if (err.message.includes('not found')) return res.status(404).send(err.message);
        if (err.message.includes('Cannot update')) return res.status(400).send(err.message);
        if (err.message.includes('Resource Conflict')) return res.status(400).send(err.message); // Business Logic Error
        
        return res.status(500).send(err.message);
    }
};

// @route   GET /api/operationplan/missing-plans/:date
exports.getMissingPlans = async (req, res) => {
    try {
        const date = req.params.date;
        const token = req.headers.authorization;

        if (isNaN(Date.parse(date))) {
            return res.status(400).send("Invalid date format. Use YYYY-MM-DD.");
        }

        const missing = await service.getMissingPlanVVNs(date, token);
        return res.status(200).json(missing);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   POST /api/operationplan/regenerate
exports.regeneratePlan = async (req, res) => {
    try {
        const { date, heuristicName } = req.query;
        const token = req.headers.authorization;

        if (isNaN(Date.parse(date))) {
            return res.status(400).send("Invalid date format. Use YYYY-MM-DD.");
        }

        const author = req.user ? req.user.name : "System";
        
        const newPlan = await service.regeneratePlan(date, heuristicName, author, token);
        
        return res.status(201).json(OperationPlanMapper.toDTO(newPlan));

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   GET /api/operationplan/resource-utilization
exports.getResourceUtilization = async (req, res) => {
    try {
        const { startDate, endDate, resourceType } = req.query;

        if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return res.status(400).send("Invalid date format. Use YYYY-MM-DD.");
        }

        const stats = await service.getResourceUtilization(startDate, endDate, resourceType);
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @route   PUT /api/operationplan/approve
// Logic: Expects id in query or body
exports.approvePlan = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        
        if(!id) return res.status(400).send("ID is required");

        await service.approvePlan(id);
        return res.status(204).send();
    } catch (err) {
        if (err.message.includes('not found')) return res.status(404).send(err.message);
        if (err.message.includes('Only draft')) return res.status(400).send(err.message);
        return res.status(500).send(err.message);
    }
};

// @route   PUT /api/operationplan/reject
exports.rejectPlan = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if(!id) return res.status(400).send("ID is required");

        await service.rejectPlan(id);
        return res.status(204).send();
    } catch (err) {
        if (err.message.includes('not found')) return res.status(404).send(err.message);
        if (err.message.includes('Only draft')) return res.status(400).send(err.message);
        return res.status(500).send(err.message);
    }
};