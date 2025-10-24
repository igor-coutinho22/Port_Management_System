using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Staff.Interfaces;

namespace PortApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDTO>>> GetStaff(
            [FromQuery] string? name,
            [FromQuery] StaffStatus? status,
            [FromQuery] string? qualification)
        {
            var staffList = await _staffService.SearchAsync(name, status, qualification);
            return Ok(staffList.Select(StaffMapper.ToDTO));
        }

        [HttpGet("{mecNumber}")]
        public async Task<ActionResult<StaffDTO>> GetByMecNumber(string mecNumber)
        {
            var staff = await _staffService.GetByMecanographicNumberAsync(mecNumber);
            if (staff == null)
                return NotFound();

            return Ok(StaffMapper.ToDTO(staff));
        }

        [HttpPost]
        public async Task<ActionResult<StaffDTO>> PostStaff(StaffDTO dto)
        {
            await _staffService.RegisterStaffAsync(
                dto.MecanographicNumber!,
                dto.ShortName!,
                dto.Email!,
                dto.Phone!,
                dto.Status,
                dto.OperationalWindow!,
                dto.Qualifications ?? new HashSet<WebApp.Models.Domain.Qualifications.Qualification>()
            );

            var created = await _staffService.GetByMecanographicNumberAsync(dto.MecanographicNumber!);
            return CreatedAtAction(nameof(GetByMecNumber), new { mecNumber = dto.MecanographicNumber }, StaffMapper.ToDTO(created!));
        }

        [HttpPut("{mecNumber}")]
        public async Task<IActionResult> UpdateStaff(string mecNumber, StaffDTO dto)
        {
            var existing = await _staffService.GetByMecanographicNumberAsync(mecNumber);
            if (existing == null)
                return NotFound();

            var updated = StaffMapper.ToDomain(dto);
            await _staffService.UpdateAsync(updated);
            return NoContent();
        }

        [HttpPatch("{mecNumber}/activate")]
        public async Task<IActionResult> Activate(string mecNumber)
        {
            await _staffService.ActivateAsync(mecNumber);
            var updated = await _staffService.GetByMecanographicNumberAsync(mecNumber);
            return Ok(StaffMapper.ToDTO(updated!));
        }

        [HttpPatch("{mecNumber}/deactivate")]
        public async Task<IActionResult> Deactivate(string mecNumber)
        {
            await _staffService.DeactivateAsync(mecNumber);
            var updated = await _staffService.GetByMecanographicNumberAsync(mecNumber);
            return Ok(StaffMapper.ToDTO(updated!));
        }
    }
}
