using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Application.Mappers;

namespace WebApp.Controllers
{
    [Authorize("RequireOperator")]
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceService _resourceService;

        public ResourcesController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        // GET: api/resources
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceDTO>>> GetResources(
            [FromQuery] string? id,
            [FromQuery] string? description,
            [FromQuery] ResourceType? type,
            [FromQuery] ResourceAvailabilityStatus? status)
        {
            var resources = await _resourceService.GetAllResourcesAsync();

            if (!string.IsNullOrWhiteSpace(id))
                resources = resources.Where(r => r.Id!.Equals(id, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(description))
                resources = resources
                    .Where(r => r.Description != null &&
                                r.Description.Contains(description, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            if (type.HasValue)
                resources = resources.Where(r => r.ResourceType == type.Value).ToList();

            if (status.HasValue)
                resources = resources.Where(r => r.Status == status.Value).ToList();

            return Ok(resources.Select(ResourceMapper.ToDTO));
        }

        // GET: api/resources/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ResourceDTO>> GetResourceById(string id)
        {
            var resource = await _resourceService.GetResourceByIdAsync(id);
            if (resource == null)
                return NotFound();

            return Ok(ResourceMapper.ToDTO(resource));
        }

        // POST: api/resources
        
        [HttpPost]
        public async Task<ActionResult<ResourceDTO>> PostResource([FromBody] ResourceDTO resourceDTO)
        {
            try
            {
                var resource = ResourceMapper.ToDomain(resourceDTO);
                await _resourceService.RegisterResourceAsync(resource);

                var created = await _resourceService.GetResourceByIdAsync(resource.Id!);
                return CreatedAtAction(nameof(GetResourceById), new { id = created!.Id }, ResourceMapper.ToDTO(created));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/resources/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResource(string id, [FromBody] ResourceDTO resourceDTO)
        {
            var resource = await _resourceService.GetResourceByIdAsync(id);
            if (resource == null)
                return NotFound();

            var updated = ResourceMapper.ToDomain(resourceDTO);
            updated.Id = id;

            await _resourceService.UpdateResourceAsync(updated);
            return NoContent();
        }

        // PATCH endpoints
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> ActivateResource(string id)
        {
            try
            {
                await _resourceService.ActivateAsync(id);
                var updated = await _resourceService.GetResourceByIdAsync(id);
                return Ok(ResourceMapper.ToDTO(updated!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> DeactivateResource(string id)
        {
            try
            {
                await _resourceService.DeactivateAsync(id);
                var updated = await _resourceService.GetResourceByIdAsync(id);
                return Ok(ResourceMapper.ToDTO(updated!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/maintenance/start")]
        public async Task<IActionResult> PutInMaintenance(string id)
        {
            try
            {
                await _resourceService.PutInMaintenanceAsync(id);
                var updated = await _resourceService.GetResourceByIdAsync(id);
                return Ok(ResourceMapper.ToDTO(updated!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/maintenance/end")]
        public async Task<IActionResult> EndMaintenance(string id)
        {
            try
            {
                await _resourceService.EndMaintenanceAsync(id);
                var updated = await _resourceService.GetResourceByIdAsync(id);
                return Ok(ResourceMapper.ToDTO(updated!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/resources/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(string id)
        {
            var resource = await _resourceService.GetResourceByIdAsync(id);
            if (resource == null)
                return NotFound();

            await _resourceService.DeleteAsync(id);
            return NoContent();
        }
    }
}
