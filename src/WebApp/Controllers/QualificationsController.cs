using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;

namespace PortApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class QualificationsController : ControllerBase
    {
        private readonly IQualificationService _qualificationService;

        public QualificationsController(IQualificationService qualificationService)
        {
            _qualificationService = qualificationService;
        }

        // GET: api/qualifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QualificationDTO>>> GetAll()
        {
            var qualifications = await _qualificationService.GetAllAsync();
            return Ok(qualifications.Select(QualificationMapper.ToDTO));
        }

        // GET: api/qualifications/{code}
        [HttpGet("{code}")]
        public async Task<ActionResult<QualificationDTO>> GetByCode(string code)
        {
            var qualification = await _qualificationService.GetByCodeAsync(code);
            if (qualification == null)
                return NotFound();

            return Ok(QualificationMapper.ToDTO(qualification));
        }

        // POST: api/qualifications
        [HttpPost]
        public async Task<ActionResult<QualificationDTO>> Post(QualificationDTO dto)
        {
            await _qualificationService.RegisterQualificationAsync(dto.Code!, dto.Name!);
            var created = await _qualificationService.GetByCodeAsync(dto.Code!);

            return CreatedAtAction(
                nameof(GetByCode),
                new { code = created!.Code },
                QualificationMapper.ToDTO(created)
            );
        }

        // PUT: api/qualifications/{code}
        [HttpPut("{code}")]
        public async Task<IActionResult> Put(string code, QualificationDTO dto)
        {
            Console.WriteLine($"[PUT] Looking for qualification code = {code}");

            var existing = await _qualificationService.GetByCodeAsync(code);
            if (existing == null)
            {
                Console.WriteLine($"[PUT] Existing was null");
                return NotFound();
            }

            existing.Name = dto.Name!;
            await _qualificationService.UpdateQualificationAsync(existing);

            return NoContent();
        }

        // DELETE: api/qualifications/{code}
        [HttpDelete("{code}")]
        public async Task<IActionResult> Delete(string code)
        {
            var existing = await _qualificationService.GetByCodeAsync(code);
            if (existing == null)
                return NotFound();

            await _qualificationService.DeleteAsync(code);

            return NoContent();
        }
    }
}
