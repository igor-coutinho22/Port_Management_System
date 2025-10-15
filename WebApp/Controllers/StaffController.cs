using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _service;

        public StaffController(IStaffService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<StaffDto>> Register([FromBody] StaffDto dto)
        {
            var result = await _service.RegisterAsync(
                dto.MecanographicNumber, dto.ShortName, dto.Email, dto.Phone,
                dto.DaysOfWeek, TimeSpan.Parse(dto.StartTime), TimeSpan.Parse(dto.EndTime)
            );
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDto>>> Search([FromQuery] string? name, [FromQuery] string? status)
        {
            var result = await _service.SearchAsync(name, status);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ChangeStatus(Guid id, [FromQuery] string status)
        {
            await _service.ChangeStatusAsync(id, status);
            return NoContent();
        }

        [HttpPut("{id}/qualifications/{qualificationId}")]
        public async Task<IActionResult> AddQualification(Guid id, Guid qualificationId)
        {
            await _service.AddQualificationAsync(id, qualificationId);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDto>> GetById(Guid id)
        {
            var result = await _service.SearchAsync(null, null);
            var staff = result.FirstOrDefault(s => s.Id == id);
            if (staff == null)
                return NotFound();
            return Ok(staff);
        }
    }
}
