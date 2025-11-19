using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
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
        public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetAll()
        {
            var orgs = await _service.GetAllAsync();
            return Ok(orgs);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrganizationDto>> GetById(Guid id)
        {
            var org = await _service.GetByIdAsync(id);
            if (org is null) return NotFound();
            return Ok(org);
        }

        [HttpPost]
        public async Task<ActionResult<OrganizationDto>> Create([FromBody] CreateOrganizationRequest req)
        {
            try
            {
                if (req is null) return BadRequest("Request body is required.");
                
                var created = await _service.CreateAsync(req);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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
        public async Task<ActionResult<OrganizationDto>> Update(Guid id, [FromBody] UpdateOrganizationRequest req)
        {
            try
            {
                if (req is null) return BadRequest("Request body is required.");

                var updated = await _service.UpdateAsync(id, req);
                return Ok(updated);
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
        public async Task<ActionResult<IEnumerable<OrganizationDto>>> Search(
            [FromQuery] string? name, [FromQuery] string? taxNumber)
        {
            var results = await _service.SearchAsync(name, taxNumber);
            return Ok(results);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}