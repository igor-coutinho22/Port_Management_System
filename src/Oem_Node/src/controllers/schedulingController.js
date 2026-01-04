const scheduleService = require('../models/application/services/scheduling/heuristicScheduleService');
const DailyScheduleRequestDTO = require('../models/application/dtos/scheduling/dailyScheduleRequestDTO');

exports.generateDailySchedule = async (req, res) => {
    try {
        const dto = new DailyScheduleRequestDTO(req.body);

        if (!dto.targetDate) {
            return res.status(400).send('TargetDate is required.');
        }
        if (!dto.heuristic) {
            return res.status(400).send('Heuristic is required.');
        }

        // Pass token from headers for downstream WebApp calls
        const token = req.headers.authorization;

        const result = await scheduleService.generateDailySchedule(
            dto.targetDate,
            dto.heuristic,
            token
        );

        return res.status(200).json(result);
    } catch (err) {
        console.error("Scheduling Error:", err);
        return res.status(500).send(err.message);
    }
};

exports.generateDailyScheduleWithMultiCrane = async (req, res) => {
    try {
        const dto = new DailyScheduleRequestDTO(req.body);

        if (!dto.targetDate) {
            return res.status(400).send('TargetDate is required.');
        }
        if (!dto.heuristic) {
            return res.status(400).send('Heuristic is required.');
        }

        const token = req.headers.authorization;

        const result = await scheduleService.generateDailyScheduleWithMultiCrane(
            dto.targetDate,
            dto.heuristic,
            token
        );

        return res.status(200).json(result);
    } catch (err) {
        console.error("Multi-Crane Scheduling Error:", err);
        return res.status(500).send(err.message);
    }
};