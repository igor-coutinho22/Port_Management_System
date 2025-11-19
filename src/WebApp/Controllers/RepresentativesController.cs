// File: WebApp/Controllers/RepresentativesController.cs
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/organizations/{orgId:guid}/[controller]")]
    public class RepresentativesController : ControllerBase
    {
        private readonly IRepresentativeService _service;

        public RepresentativesController(IRepresentativeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RepresentativeDto>>> GetByOrganization(Guid orgId)
        {
            var reps = await _service.GetByOrganizationAsync(orgId);
            return Ok(reps);
        }

        [HttpPost]
        public async Task<ActionResult<RepresentativeDto>> Create(Guid orgId, [FromBody] CreateRepresentativeRequest req)
        {
            try
            {
                if (req is null) return BadRequest("Request body is required.");

                var rep = await _service.CreateAsync(orgId, req);
                return CreatedAtAction(nameof(GetByOrganization), new { orgId }, rep);
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
        public async Task<ActionResult<RepresentativeDto>> Update(Guid orgId, Guid repId, [FromBody] UpdateRepresentativeRequest req)
        {
            try
            {
                if (req is null) return BadRequest("Request body is required.");

                var rep = await _service.UpdateAsync(repId, req);
                return Ok(rep);
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
        public async Task<IActionResult> Delete(Guid orgId, Guid repId)
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
        public async Task<ActionResult<IEnumerable<RepresentativeDto>>> GetAll(
            [FromQuery] Guid? organizationId, [FromQuery] bool? active)
        {
            var reps = await _service.GetAllAsync(organizationId, active);
            return Ok(reps);
        }
    }
}