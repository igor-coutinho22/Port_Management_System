using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VesselVisitNotificationController : ControllerBase
    {
        private readonly IVesselVisitNotificationService _service;

        public VesselVisitNotificationController(IVesselVisitNotificationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VesselVisitNotification dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var notification = await _service.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound(new { Message = $"Vessel Visit Notification with ID {id} not found." });
            }

            return Ok(notification);    
        }

        [HttpPut("{id}/submit")]
        public async Task<IActionResult> Submit(Guid id)
        {
            await _service.SubmitAsync(id);
            return Ok();
        }
    }
}
