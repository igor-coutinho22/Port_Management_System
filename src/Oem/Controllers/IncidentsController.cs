using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oem.Models.Application.Mappers;
using Oem.Models.Domain.Incidents;
using Oem.Models.Domain.Incidents.Service; // Namespace

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncidentsController : ControllerBase
    {
        private readonly IIncidentService _service;

        public IncidentsController(IIncidentService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<IncidentDTO>>> GetAll()
        {
            var items = await _service.GetAllIncidentsAsync();
            return Ok(items.Select(IncidentMapper.ToDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentDTO>> GetById(Guid id)
        {
            var item = await _service.GetIncidentByIdAsync(id);
            if (item == null) return NotFound("Incident not found.");
            return Ok(IncidentMapper.ToDTO(item));
        }

        [HttpPost("Create")]
        public async Task<ActionResult<IncidentDTO>> Create(CreateIncidentDTO dto)
        {
            try
            {
                var entity = IncidentMapper.ToDomain(dto);
                await _service.CreateIncidentAsync(entity);

                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, IncidentMapper.ToDTO(entity));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIncidentDTO dto)
        {
            var entity = await _service.GetIncidentByIdAsync(id);
            if (entity == null) return NotFound();

            try {
                entity.Update(dto.Description, dto.Severity, dto.AffectedVesselVisitIds);
                await _service.UpdateIncidentAsync(entity);
                return Ok(IncidentMapper.ToDTO(entity));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/Resolve")]
        public async Task<IActionResult> Resolve(Guid id)
        {
            var entity = await _service.GetIncidentByIdAsync(id);
            if (entity == null) return NotFound();

            try {
                entity.Resolve(DateTime.UtcNow);
                await _service.UpdateIncidentAsync(entity);
                return Ok(IncidentMapper.ToDTO(entity));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _service.GetIncidentByIdAsync(id);
            if (entity == null) return NotFound();

            await _service.DeleteIncidentAsync(id);
            return NoContent();
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<IncidentDTO>>> Search(
            [FromQuery] DateTime? start, 
            [FromQuery] DateTime? end, 
            [FromQuery] string? status, 
            [FromQuery] string? severity,
            [FromQuery] string? vveIds)
        {
             var items = await _service.SearchIncidentsAsync(start, end, status, severity, vveIds);
             return Ok(items.Select(IncidentMapper.ToDTO));
        }
    }
}
