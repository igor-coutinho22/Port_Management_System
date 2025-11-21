using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [Authorize("RequireOfficer")]
    [ApiController]
    [Route("api/[controller]")]
    public class RepresentativesController : ControllerBase
    {
        private readonly IRepresentativeService _service;

        public RepresentativesController(IRepresentativeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> GetByOrganizationId(Guid orgId)
        {
            var reps = await _service.GetByOrganizationIdAsync(orgId);
            return Ok(reps.Select(RepresentativeMapper.ToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(Guid repId)
        {
            var rep = await _service.GetByIdAsync(repId);
            return rep == null ? NotFound($"Representative with ID {repId} not found.") : Ok(RepresentativeMapper.ToDto(rep));
        }

        [HttpPost]
        public async Task<ActionResult> Create(Guid orgId, [FromBody] CreateRepresentativeDto dto)
        {
            try
            {
                if (dto is null) return BadRequest("Request body is required.");

                var rep = RepresentativeMapper.ToDomain(orgId, dto);
                await _service.CreateAsync(orgId, rep);

                var created = await _service.GetByIdAsync(rep.Id);
                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, RepresentativeMapper.ToDto(created));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{repId:guid}")]
        public async Task<ActionResult> Update(Guid repId, [FromBody] UpdateRepresentativeDto dto)
        {
            try
            {
                if (dto is null) return BadRequest("Request body is required.");

                var existing = await _service.GetByIdAsync(repId);
                if (existing == null)
                    return NotFound($"Representative with ID {repId} not found.");

                RepresentativeMapper.UpdateFromDto(existing, dto);
                await _service.UpdateAsync(repId, existing);
                return Ok(RepresentativeMapper.ToDto(existing));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{repId:guid}")]
        public async Task<IActionResult> Delete(Guid repId)
        {
            try
            {
                await _service.DeleteAsync(repId);
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

        [HttpGet("all")]
        public async Task<ActionResult> GetAll()
        {
            var reps = await _service.GetAllAsync();
            return Ok(reps.Select(RepresentativeMapper.ToDto));
        }

        [HttpPatch("{repId:guid}/activate")]
        public async Task<IActionResult> Activate(Guid repId)
        {
            try
            {
                await _service.ActivateAsync(repId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{repId:guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid repId)
        {
            try
            {
                await _service.DeactivateAsync(repId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}