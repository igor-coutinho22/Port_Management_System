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
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationsController(IOrganizationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var orgs = await _service.GetAllAsync();
            return Ok(orgs);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult> GetById(Guid id)
        {
            var org = await _service.GetByIdAsync(id);
            return org == null ? NotFound($"Organization with ID {id} not found.") : Ok(OrganizationMapper.ToDto(org));
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateOrganizationDto dto)
        {
            try
            {
                var org = OrganizationMapper.ToDomain(dto);
                await _service.CreateAsync(org);

                var created = await _service.GetByIdAsync(org.Id);
                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, OrganizationMapper.ToDto(created));
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

        [HttpPut("{id:guid}")]
        public async Task<ActionResult> Update(Guid id, [FromBody] UpdateOrganizationDto dto)
        {
            try
            {
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                    return NotFound($"Organization with ID {id} not found.");

                OrganizationMapper.UpdateFromDto(existing, dto);

                await _service.UpdateAsync(id, existing);
                return Ok(OrganizationMapper.ToDto(existing));
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

        [HttpGet("search")]
        public async Task<ActionResult> Search(
            [FromQuery] string? name, [FromQuery] string? taxNumber)
        {
            if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(taxNumber))
            {
                return BadRequest("At least one search parameter (name or tax number) must be provided.");
            }

            var results = await _service.SearchAsync(name, taxNumber);
            return Ok(results.Select(OrganizationMapper.ToDto));
        }

        [HttpPatch("{id:guid}/activate")]
        public async Task<IActionResult> ActivateOrg(Guid id)
        {
            try
            {
                var org = await _service.GetByIdAsync(id);
                if (org == null)
                    return NotFound($"Organization with ID {id} not found.");

                await _service.ActivateAsync(id);

                var updated = await _service.GetByIdAsync(id);
                return Ok(OrganizationMapper.ToDto(updated!));
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

        [HttpPatch("{id:guid}/deactivate")]
        public async Task<IActionResult> DeactivateOrg(Guid id)
        {
            try
            {
                var org = await _service.GetByIdAsync(id);
                if (org == null)
                    return NotFound($"Organization with ID {id} not found.");

                await _service.DeactivateAsync(id);

                var updated = await _service.GetByIdAsync(id);
                return Ok(OrganizationMapper.ToDto(updated!));
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

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}