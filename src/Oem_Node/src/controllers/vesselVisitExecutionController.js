const service = require('../models/application/services/vesselVisitExecutionService');
const webAppService = require('../models/infrastructure/integration/webAppService');
const Mapper = require('../models/application/mappers/vesselVisitExecutionMapper');
const CreateDTO = require('../models/application/dtos/CreateVesselVisitExecutionDTO');

// @desc    Create a new Vessel Visit Execution
// @route   POST /api/vesselvisitexecution/Create
exports.create = async (req, res) => {
    try {
        if (!req.body) return res.status(400).send('Invalid data.');

        // Extract the Bearer token from the incoming request headers
        // This is needed to make authorized calls to the WebApp module
        const token = req.headers.authorization; 

        // Sanitize input using DTO
        const dto = new CreateDTO(req.body);

        if (!dto.vesselVisitId) {
            return res.status(400).send('VesselVisitId is required.');
        }

        // 1. Fetch the actual VVN object from Master Data (Pass Token)
        const vvnDto = await webAppService.getVesselVisitById(dto.vesselVisitId, token);

        // 2. Check if it exists
        if (!vvnDto) {
            return res.status(400).send(`Vessel Visit with ID '${dto.vesselVisitId}' does not exist or could not be retrieved.`);
        }

        // 3. Validate Vessel IMO (Pass Token)
        const isIMOValid = await webAppService.isVesselValid(dto.vesselIMO, token);
        if (!isIMOValid) {
            return res.status(400).send('Vessel IMO is not valid.');
        }

        // 4. Check consistency (IMO in request must match IMO in VVN)
        if (vvnDto.vesselIMO !== dto.vesselIMO) {
            return res.status(400).send('Vessel IMO does not match the one in the Vessel Visit Notification.');
        }

        // Set CreatedBy (Simulate C# User?.Identity?.Name)
        dto.createdBy = req.body.createdBy || 'System';

        // Convert DTO to Domain Entity
        const domainEntity = Mapper.toDomain(dto);

        // Save to Database via Service
        await service.createVesselVisitExecution(domainEntity);

        // Return Created Response (201)
        const responseDTO = Mapper.toDTO(domainEntity);
        return res.status(201).json(responseDTO);

    } catch (err) {
        console.error("Create Error:", err);
        // Handle specific domain exceptions (mirrors C# ArgumentException logic)
        if (err.message.includes('Argument') || err.message.includes('InvalidOperation')) {
            return res.status(400).send(err.message);
        }
        return res.status(500).send(`Internal server error: ${err.message}`);
    }
};

// @desc    Get execution by ID
// @route   GET /api/vesselvisitexecution/:id
exports.getById = async (req, res) => {
    try {
        const vvn = await service.getVesselVisitExecutionById(req.params.id);
        
        if (!vvn) {
            return res.status(400).send('Vessel Visit Execution not found.');
        }

        return res.status(200).json(Mapper.toDTO(vvn));
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @desc    Get all executions
// @route   GET /api/vesselvisitexecution/GetAll
exports.getAll = async (req, res) => {
    try {
        const vvnList = await service.getAllVesselVisitExecutionsAsync();
        const dtoList = vvnList.map(item => Mapper.toDTO(item));
        return res.status(200).json(dtoList);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// @desc    Delete execution
// @route   DELETE /api/vesselvisitexecution/:id
exports.delete = async (req, res) => {
    try {
        // Verify existence first
        const vvn = await service.getVesselVisitExecutionById(req.params.id);
        
        if (!vvn) {
            return res.status(400).send('Vessel Visit Execution not found.');
        }

        await service.deleteVesselVisitExecution(req.params.id);
        
        return res.status(204).send(); // 204 No Content

    } catch (err) {
        if (err.message.includes('Argument') || err.message.includes('InvalidOperation')) {
            return res.status(400).send(err.message);
        }
        return res.status(500).send(`Internal server error: ${err.message}`);
    }
};