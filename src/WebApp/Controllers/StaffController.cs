using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Staff.Interfaces;
using WebApp.Models.Domain.Qualifications;
using Microsoft.AspNetCore.Authorization;

namespace WebApp.Controllers
{
    [Authorize]
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
            var staff = StaffMapper.ToDomain(dto);

            await _staffService.RegisterStaffAsync(staff);

            var created = await _staffService.GetByMecanographicNumberAsync(dto.MecanographicNumber!);
            return CreatedAtAction(nameof(GetByMecNumber),
                new { mecNumber = dto.MecanographicNumber },
                StaffMapper.ToDTO(created!));
        }

        [HttpPut("{mecNumber}")]
        public async Task<IActionResult> UpdateStaff(string mecNumber, StaffDTO dto)
        {
            var existing = await _staffService.GetByMecanographicNumberAsync(mecNumber);
            if (existing == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.ShortName))
                existing.ShortName = dto.ShortName;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                existing.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Phone))
                existing.Phone = dto.Phone;

            if (!string.IsNullOrWhiteSpace(dto.OperationalWindow))
                existing.OperationalWindow = dto.OperationalWindow;

            existing.Status = dto.Status;

            if (dto.Qualifications != null)
            {
                existing.QualificationLinks.Clear();

                foreach (var q in dto.Qualifications)
                {
                    existing.QualificationLinks.Add(new QualificationLink(
                        existing.MecanographicNumber,
                        q.Code,
                        q.DateObtained,
                        q.ExpiryDate
                    ));
                }
            }

            await _staffService.UpdateAsync(existing);
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

        [HttpPost("{mecNumber}/qualifications")]
        public async Task<IActionResult> AddQualification(
            string mecNumber,
            [FromBody] QualificationDTO dto)
        {
            var qualification = new Qualification(dto.Code, dto.Name);
            await _staffService.AddQualificationToStaffAsync(
                mecNumber,
                qualification
            );
            return NoContent();
        }

        [HttpDelete("{mecNumber}/qualifications/{qualificationCode}")]
        public async Task<IActionResult> RemoveQualification(string mecNumber, string qualificationCode)
        {
            await _staffService.RemoveQualificationFromStaffAsync(mecNumber, qualificationCode);
            return NoContent();
        }

        // DELETE: api/staff/{mecNumber}
        [HttpDelete("{mecNumber}")]
        public async Task<IActionResult> Delete(string mecNumber)
        {
            await _staffService.DeleteAsync(mecNumber);
            return NoContent();
        }
    }
}
