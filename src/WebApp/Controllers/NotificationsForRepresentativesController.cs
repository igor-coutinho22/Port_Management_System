using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.VesselVisits.Services;

namespace WebApp.Controllers
{
    [Authorize("RequireRepresentative")]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsForRepresentativesController : ControllerBase
    {
        private readonly IVesselVisitNotificationService _service;
        private readonly ILogger<NotificationsForRepresentativesController> _logger;

        public NotificationsForRepresentativesController(
            IVesselVisitNotificationService service,
            ILogger<NotificationsForRepresentativesController> logger)
        {
            _service = service;
            _logger = logger;
        }

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

        [HttpGet]
        public async Task<IActionResult> GetAllOnOrgAsync(Guid organizationId)
        {
            try
            {
                var notifications = await _service.GetAllOnOrgAsync(organizationId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving Vessel Visit Notifications.");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}