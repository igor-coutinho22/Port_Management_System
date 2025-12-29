const service = require("../models/application/services/vesselVisitExecutionService");
const webAppService = require("../models/infrastructure/integration/webAppService");
const Mapper = require("../models/application/mappers/vesselVisitExecutionMapper");
const CreateDTO = require("../models/application/dtos/CreateVesselVisitExecutionDTO");
const UpdateDTO = require("../models/application/dtos/UpdateVesselVisitExecutionDTO");

// @desc    Create a new Vessel Visit Execution
// @route   POST /api/vesselvisitexecution/Create
exports.create = async (req, res) => {
  try {
    if (!req.body) return res.status(400).send("Invalid data.");

    const token = req.headers.authorization;
    const dto = new CreateDTO(req.body);

    // 1. Basic Validation
    if (!dto.vesselVisitId)
      return res.status(400).send("VesselVisitId is required.");

    // 2. Fetch VVN from Master Data (Web App)
    const vvnDto = await webAppService.getVesselVisitById(
      dto.vesselVisitId,
      token
    );
    if (!vvnDto) {
      return res
        .status(400)
        .send(`Vessel Visit with ID '${dto.vesselVisitId}' does not exist.`);
    }

    // 3. Validate Vessel IMO and Dock ID
    const isIMOValid = await webAppService.isVesselValid(dto.vesselIMO, token);
    if (!isIMOValid) return res.status(400).send("Vessel IMO is not valid.");

    // 4. Consistency Check
    if (vvnDto.vesselIMO !== dto.vesselIMO) {
      return res.status(400).send("Vessel IMO does not match notification.");
    }
    if (vvnDto.dockId && dto.dockId && vvnDto.dockId !== dto.dockId) {
      return res
        .status(400)
        .send("Dock ID does not match notification dock assignment.");
    }

    // 5. Convert DTO -> Domain
    dto.createdBy = req.user ? req.user.name : "System";
    const domainEntity = Mapper.toDomain(dto);

    // 6. Save via Service
    await service.createVesselVisitExecution(domainEntity, token);

    // 7. Return Result DTO
    return res.status(201).json(Mapper.toDTO(domainEntity));
  } catch (err) {
    console.error("Create Error:", err.message);
    if (err.message.includes("InvalidOperation"))
      return res.status(409).send(err.message); // Conflict
    if (err.message.includes("Argument"))
      return res.status(400).send(err.message);
    return res.status(500).send(err.message);
  }
};

// @desc    Get all executions
// @route   GET /api/vesselvisitexecution/GetAll
exports.getAll = async (req, res) => {
  try {
    const domainList = await service.getAllVesselVisitExecutionsAsync();
    const dtoList = domainList.map((item) => Mapper.toDTO(item));
    return res.status(200).json(dtoList);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// @desc    Get execution by ID
// @route   GET /api/vesselvisitexecution/:id
exports.getById = async (req, res) => {
  try {
    const domainEntity = await service.getVesselVisitExecutionById(
      req.params.id
    );
    if (!domainEntity) {
      return res.status(404).send("Vessel Visit Execution not found.");
    }
    return res.status(200).json(Mapper.toDTO(domainEntity));
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// @desc    Update VVE with Berth Time, Dock and Executed Operations
// @route   PUT /api/vesselvisitexecution/:id
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.body) return res.status(400).send('Invalid request body.');

        const token = req.headers.authorization;
        
        // Use the Unified DTO
        const dto = new UpdateDTO(req.body);
        dto.author = req.user ? req.user.name : (req.body.author || 'System');

        // Call Unified Service Method
        const updatedEntity = await service.updateVesselVisitExecution(id, dto, token);

        return res.status(200).json(Mapper.toDTO(updatedEntity));

    } catch (err) {
        console.error("Update Error:", err.message);
        if (err.message.includes('not found')) return res.status(404).send(err.message);
        if (err.message.includes('Argument')) return res.status(400).send(err.message);
        return res.status(500).send(err.message);
    }
};

// @desc    Get planned operations (Helper for UI)
// @route   GET /api/vesselvisitexecution/:id/planned-operations
exports.getPlannedOperations = async (req, res) => {
    try {
        const id = req.params.id;
        const list = await service.getPlannedOperations(id);
        res.status(200).json(list);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// @desc    Search VVEs with filters
// @route   GET /api/vesselvisitexecution/Search
exports.search = async (req, res) => {
    try {
        // Extract query params: ?start=...&end=...&vessel=...&status=...
        const filters = {
            start: req.query.start,
            end: req.query.end,
            vessel: req.query.vessel,
            status: req.query.status
        };

        const results = await service.searchVesselVisitExecutions(filters);
        
        // Map to DTOs (which calculates the metrics)
        const dtos = results.map(r => Mapper.toDTO(r));
        
        res.status(200).json(dtos);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// @desc    Delete execution
// @route   DELETE /api/vesselvisitexecution/:id
exports.delete = async (req, res) => {
  try {
    await service.deleteVesselVisitExecution(req.params.id);
    return res.status(204).send();
  } catch (err) {
    if (err.message.includes("not found"))
      return res.status(404).send(err.message);
    return res.status(500).send(err.message);
  }
};
