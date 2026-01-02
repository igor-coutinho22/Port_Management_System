using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oem.Models.Application.Mappers;
using Oem.Models.Domain.Incidents.Service; // Changed namespaces
using Oem.Models.Domain.Incidents;

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncidentTypesController : ControllerBase
    {
        private readonly IIncidentService _service;

        public IncidentTypesController(IIncidentService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<IncidentTypeDTO>>> GetAll()
        {
            var types = await _service.GetAllIncidentTypesAsync();
            return Ok(types.Select(IncidentTypeMapper.ToDTO));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentTypeDTO>> GetById(Guid id)
        {
            var type = await _service.GetIncidentTypeByIdAsync(id);
            if (type == null) return NotFound("Incident Type not found.");
            return Ok(IncidentTypeMapper.ToDTO(type));
        }

        [HttpPost("Create")]
        public async Task<ActionResult<IncidentTypeDTO>> Create(CreateIncidentTypeDTO dto)
        {
            try
            {
                var entity = IncidentTypeMapper.ToDomain(dto);
                await _service.CreateIncidentTypeAsync(entity);

                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, IncidentTypeMapper.ToDTO(entity));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // [US 4.1.12] - CRUD implies Update/Delete too
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateIncidentTypeDTO dto)
        {
            var entity = await _service.GetIncidentTypeByIdAsync(id);
            if (entity == null) return NotFound();

            try {
                entity.Update(dto.Name, dto.Description, dto.Severity, dto.ParentTypeId);
                await _service.UpdateIncidentTypeAsync(entity);
                return Ok(IncidentTypeMapper.ToDTO(entity));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _service.GetIncidentTypeByIdAsync(id);
            if (entity == null) return NotFound();

            await _service.DeleteIncidentTypeAsync(id);
            return NoContent();
        }
    }
}
