using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Mappers;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulingController : ControllerBase
    {
        private readonly IVesselService _vesselService;
        private readonly IHeuristicScheduleService _heuristicService;
        private readonly IOptimalScheduleService _optimalService; // optional – if user story 3.4.2 is implemented

        public SchedulingController(
            IVesselService vesselService,
            IHeuristicScheduleService heuristicService,
            IOptimalScheduleService optimalService)
        {
            _vesselService = vesselService;
            _heuristicService = heuristicService;
            _optimalService = optimalService;
        }

        // ------------------------------------------------------------
        // GET: api/scheduling?mode=heuristic
        // Generates a schedule using the selected algorithm
        // ------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetScheduleAsync([FromQuery] string mode = "heuristic")
        {
            try
            {
                // Retrieve all vessels (can be filtered to today's vessels)
                var vessels = await _vesselService.GetAllVesselsAsync();
                if (vessels == null || !vessels.Any())
                    return NotFound("No vessels found to schedule.");

                // Choose which algorithm to use
                var result = mode.ToLower() switch
                {
                    "optimal" => _optimalService.ComputeSchedule(vessels),
                    _ => _heuristicService.ComputeSchedule(vessels)
                };

                // Map to DTO for response
                var dto = SchedulingResultMapper.ToDTO(result);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating schedule: {ex.Message}");
            }
        }

        // ------------------------------------------------------------
        // POST: api/scheduling/heuristic
        // Explicit endpoint for heuristic scheduling
        // ------------------------------------------------------------
        [HttpPost("heuristic")]
        public async Task<IActionResult> GenerateHeuristicScheduleAsync()
        {
            try
            {
                var vessels = await _vesselService.GetAllVesselsAsync();
                if (vessels == null || !vessels.Any())
                    return NotFound("No vessels found to schedule.");

                var result = _heuristicService.ComputeSchedule(vessels);
                var dto = SchedulingResultMapper.ToDTO(result);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating heuristic schedule: {ex.Message}");
            }
        }

        // ------------------------------------------------------------
        // POST: api/scheduling/optimal
        // Explicit endpoint for optimal scheduling (optional)
        // ------------------------------------------------------------
        [HttpPost("optimal")]
        public async Task<IActionResult> GenerateOptimalScheduleAsync()
        {
            try
            {
                var vessels = await _vesselService.GetAllVesselsAsync();
                if (vessels == null || !vessels.Any())
                    return NotFound("No vessels found to schedule.");

                var result = _optimalService.ComputeSchedule(vessels);
                var dto = SchedulingResultMapper.ToDTO(result);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating optimal schedule: {ex.Message}");
            }
        }
    }
}
