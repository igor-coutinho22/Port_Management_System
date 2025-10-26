using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.VesselVisits.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VesselVisitNotificationController : ControllerBase
    {
        private readonly IVesselVisitNotificationService _service;
        private readonly ILogger<VesselVisitNotificationController> _logger;

        public VesselVisitNotificationController(
            IVesselVisitNotificationService service,
            ILogger<VesselVisitNotificationController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/vesselvisitnotification
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VesselVisitNotificationDTO>>> GetAllAsync()
        {
            var visits = await _service.GetAllAsync();
            return Ok(visits);
        }

        // GET: api/vesselvisitnotification/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VesselVisitNotificationDTO>>> SearchAsync(
            [FromQuery] string? vesselIMO,
            [FromQuery] string? status,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string? representative)
        {
            try
            {
                var filter = VesselVisitNotificationMapper.ToFilterDTO(
                    vesselIMO, status, fromDate, toDate, representative);

                var visits = await _service.SearchAsync(filter);
                return Ok(visits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while searching Vessel Visit Notifications.");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/vesselvisitnotification/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<VesselVisitNotificationDTO>> GetByIdAsync(Guid id)
        {
            var visit = await _service.GetByIdAsync(id);
            if (visit == null)
                return NotFound();

            return Ok(visit);
        }

        // POST: api/vesselvisitnotification
        [HttpPost]
        public async Task<ActionResult<VesselVisitNotificationDTO>> CreateAsync(
            [FromBody] VesselVisitNotificationDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetByIdAsync), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating Vessel Visit Notification.");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/vesselvisitnotification/{id}/submit
        [HttpPut("{id:guid}/submit")]
        public async Task<IActionResult> SubmitAsync(Guid id)
        {
            try
            {
                await _service.SubmitAsync(id);
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
                _logger.LogError(ex, "Unexpected error while submitting Vessel Visit Notification.");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/vesselvisitnotification/{id}/approve
        [HttpPut("{id:guid}/approve")]
        public async Task<IActionResult> ApproveAsync(Guid id, [FromQuery] Guid officerId, [FromQuery] Guid dockId)
        {
            try
            {
                await _service.ApproveAsync(id, officerId, dockId);
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
        }

        // PUT: api/vesselvisitnotification/{id}/reject
        [HttpPut("{id:guid}/reject")]
        public async Task<IActionResult> RejectAsync(Guid id, [FromQuery] Guid officerId, [FromBody] string reason)
        {
            try
            {
                await _service.RejectAsync(id, officerId, reason);
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
        }
        
        [HttpPut("{id:guid}/updateWhileInProgress")]
        public async Task<IActionResult> UpdateWhileInProgress(Guid id, [FromBody] VesselVisitNotificationDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            try
            {
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                    return NotFound("Vessel Visit Notification not found.");

                var updated = VesselVisitNotificationMapper.ToEntity(dto);
                await _service.UpdateAsync(id, updated);
                
                // Return the updated entity
                var result = await _service.GetByIdAsync(id);
                return Ok(result);
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
                _logger.LogError(ex, "Unexpected error while updating Vessel Visit Notification.");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
