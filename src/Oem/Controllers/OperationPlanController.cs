using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Oem.Models.Application.DTOs;
using Oem.Models.Application.Services;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Models.DTOs.OperationPlans;
using Oem.Models.Mappers;

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [Authorize("RequireOperator")]
    [ApiController]
    public class OperationPlanController : ControllerBase
    {
        private readonly IOperationPlanService _service;
        private readonly IWebAppService _webAppService;

        public OperationPlanController(IOperationPlanService service, IWebAppService webAppService)
        {
            _service = service;
            _webAppService = webAppService;
        }

        [HttpPost]
        public async Task<ActionResult> SavePlan([FromBody] CreateOperationPlanDTO request)
        {
            // Use Console.WriteLine to guarantee visibility
            Console.WriteLine($"--> [CONTROLLER] 1. Request Received for {request.ScheduleDate}");

            try
            {
                // 1. Fetch Visits
                var visits = await _webAppService.GetApprovedVisitsForDateAsync(request.ScheduleDate);

                // SAFETY CHECK: Ensure visits is not null
                if (visits == null)
                {
                    visits = new List<VesselVisitNotificationDTO>();
                }

                // 2. Map Visits (Safe Dictionary)
                var visitMap = visits
                    .Where(v => v != null)
                    .DistinctBy(v => v.Id)
                    .ToDictionary(v => v.Id);

                // 3. Map to Domain
                request.Author = User?.Identity?.Name ?? "System";
                var domainPlan = OperationPlanMapper.ToDomain(request, visitMap);

                // 4. Save
                await _service.SavePlanAsync(domainPlan);

                var createdDto = OperationPlanMapper.ToDto(domainPlan);
                return CreatedAtAction(nameof(GetPlanById), new { id = domainPlan.Id }, createdDto);
            }
            catch (Exception ex)
            {
                // Use Error Log so it shows as Red/Critical
                Console.WriteLine($"--> [CONTROLLER ERROR] {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                // Return 500 so the frontend knows it failed
                return StatusCode(500, new { message = "Backend Error: " + ex.Message });
            }
        }

        [HttpGet("Search")]
        public async Task<ActionResult> SearchPlans([FromQuery] string? startDate, [FromQuery] string? endDate, [FromQuery] string? vesselIMO)
        {
            if (string.IsNullOrEmpty(startDate) && string.IsNullOrEmpty(endDate) && string.IsNullOrEmpty(vesselIMO))
            {
                return BadRequest("At least one search parameter (date(s) or vesselIMO) must be provided.");
            }

            DateOnly? parsedStartDate = null;
            DateOnly? parsedEndDate = null;
            if (!string.IsNullOrEmpty(startDate))
            {
                if (!DateOnly.TryParse(startDate, out var tempDate))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD.");
                }
                parsedStartDate = tempDate;
            }

            if (!string.IsNullOrEmpty(endDate))
            {
                if (!DateOnly.TryParse(endDate, out var tempDate))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD.");
                }
                parsedEndDate = tempDate;
            }

            if (!string.IsNullOrEmpty(vesselIMO))
            {
                bool isValidVessel = await _webAppService.IsVesselValidAsync(vesselIMO);
                if (!isValidVessel)
                {
                    return BadRequest($"Vessel with IMO {vesselIMO} is not valid (or WebApp service is unreachable).");
                }
            }

            var plans = await _service.SearchPlansAsync(parsedStartDate, parsedEndDate, vesselIMO);

            if (plans == null || !plans.Any())
            {
                return NotFound("No operation plans found matching the criteria.");
            }

            return Ok(plans.Select(OperationPlanMapper.ToDto));
        }

        [HttpGet("GetById/{id}")]
        public async Task<ActionResult> GetPlanById(Guid id)
        {
            var plan = await _service.GetPlanByIdAsync(id);
            if (plan == null)
            {
                return NotFound($"No operation plan found for ID {id}");
            }

            return Ok(OperationPlanMapper.ToDto(plan));
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult> GetAllPlans()
        {
            var plans = await _service.GetAllPlansAsync();
            return Ok(plans.Select(OperationPlanMapper.ToDto));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePlan([FromRoute] Guid id)
        {
            try
            {
                await _service.DeletePlanAsync(id);

                return NoContent(); // 204 Success
            }
            catch (ArgumentException ex)
            {
                // This handles "ID not found" logic from the Service
                Console.WriteLine($"--> [CONTROLLER ERROR] {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"--> [CONTROLLER CRASH] {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdatePlan(Guid id, [FromBody] UpdateOperationPlanDTO dto)
        {
            if (dto == null) 
                return BadRequest("Request body cannot be empty.");

            try
            {
                var existingPlan = await _service.GetPlanByIdAsync(id);
                if (existingPlan == null)
                    return NotFound($"No operation plan found for ID {id}");

                // Set author from context if not provided
                if (string.IsNullOrEmpty(dto.Author)) dto.Author = User?.Identity?.Name ?? "System";

                var updatedPlan = await _service.UpdatePlanAsync(id, dto);

                var updatedDto = OperationPlanMapper.ToDto(updatedPlan);
                return Ok(updatedDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("missing-plans/{date}")]
        public async Task<ActionResult<IEnumerable<VesselVisitNotificationDTO>>> GetMissingPlans(string date)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
                return BadRequest("Invalid date format. Use YYYY-MM-DD.");

            var missing = await _service.GetMissingPlanVVNsAsync(parsedDate);
            return Ok(missing);
        }

        [HttpPost("regenerate")]
        public async Task<ActionResult> RegeneratePlan([FromQuery] string date, [FromQuery] string heuristicName)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
                return BadRequest("Invalid date format. Use YYYY-MM-DD.");

            try
            {
                var author = User?.Identity?.Name ?? "System";
                var newPlan = await _service.RegeneratePlanAsync(parsedDate, heuristicName, author);
                return CreatedAtAction(nameof(GetPlanById), new { id = newPlan.Id }, OperationPlanMapper.ToDto(newPlan));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("resource-utilization")]
        public async Task<ActionResult<IEnumerable<ResourceUtilizationDTO>>> GetResourceUtilization([FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] string resourceType)
        {
            if (!DateOnly.TryParse(startDate, out var parsedStart) || !DateOnly.TryParse(endDate, out var parsedEnd))
                return BadRequest("Invalid date format. Use YYYY-MM-DD.");

            var stats = await _service.GetResourceUtilizationAsync(parsedStart, parsedEnd, resourceType);
            return Ok(stats);
        }

        [HttpPut("approve")]
        public async Task<ActionResult> ApprovePlan(Guid id)
        {
            try
            {
                await _service.ApprovePlanAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("reject")]
        public async Task<ActionResult> RejectPlan(Guid id)
        {
            try
            {
                await _service.RejectPlanAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}