using System.ComponentModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Agents;

namespace WebApp.Controllers
{
    [Authorize("RequireOfficer")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _service;
        private readonly IRepresentativeService _representativeService;

        public OrganizationsController(IOrganizationService service, IRepresentativeService representativeService)
        {
            _service = service;
            _representativeService = representativeService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var orgs = await _service.GetAllAsync();
            return Ok(orgs.Select(OrganizationMapper.ToDto));
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

                List<Representative> representatives = new List<Representative>();

                foreach (var repDto in dto.Representatives)
                {
                    var rep = await _representativeService.GetByIdAsync(repDto.Id);
                    RepresentativeMapper.GetFromDto(rep!, org.Id, repDto);
                    representatives.Add(rep!);
                }

                await _service.CreateAsync(org, representatives);

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

        [HttpPost("{id:guid}/add")]
        public async Task<IActionResult> AddRepresentative(Guid id, [FromBody] GetRepresentativeToAddDto dto)
        {
            try
            {
                var org = await _service.GetByIdAsync(id);
                if (org == null)
                    return NotFound($"Organization with ID {id} not found.");

                var rep = await _representativeService.GetByIdAsync(dto.Id);
                RepresentativeMapper.GetFromDto(rep!, id, dto);

                await _service.AddRepresentativeAsync(id, rep!);

                var updated = await _service.GetByIdAsync(id);
                return Ok(OrganizationMapper.ToDto(updated!));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id:guid}/remove")]
        public async Task<IActionResult> RemoveRepresentative(Guid id, [FromBody] Guid repId)
        {
            try
            {
                var org = await _service.GetByIdAsync(id);
                if (org == null)
                    return NotFound($"Organization with ID {id} not found.");

                var rep = await _representativeService.GetByIdAsync(repId);
                if (rep == null)
                    return NotFound($"Representative with ID {repId} not found.");

                await _service.RemoveRepresentativeAsync(id, repId);

                var updated = await _service.GetByIdAsync(id);
                return Ok(OrganizationMapper.ToDto(updated!));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
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