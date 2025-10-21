using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;
using WebApp.Models.Domain.Qualifications;

namespace PortApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceService _resourceService;

        public ResourcesController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<ResourceDTO>> GetResources(
            [FromQuery] string? id,
            [FromQuery] string? description,
            [FromQuery] ResourceType? type,
            [FromQuery] ResourceAvailabilityStatus? status)
        {
            var resources = _resourceService.GetAllResources();

            if (!string.IsNullOrWhiteSpace(id))
                resources = resources.Where(r => r.Id!.Equals(id, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(description))
                resources = resources.Where(r => r.Description != null &&
                    r.Description.Contains(description, StringComparison.OrdinalIgnoreCase)).ToList();

            if (type.HasValue)
                resources = resources.Where(r => r.ResourceType == type.Value).ToList();

            if (status.HasValue)
                resources = resources.Where(r => r.Status == status.Value).ToList();

            return Ok(resources.Select(ResourceToDTO));
        }

        [HttpGet("{id}")]
        public ActionResult<ResourceDTO> GetResource(string id)
        {
            var resource = _resourceService.GetResourceById(id);
            if (resource == null)
                return NotFound();

            return Ok(ResourceToDTO(resource));
        }

        [HttpPost]
        public ActionResult<ResourceDTO> PostResource(ResourceDTO resourceDTO)
        {
            var qualifications = resourceDTO.QualificationRequirements ?? new HashSet<Qualification>();

            _resourceService.RegisterResource(
                id: resourceDTO.Id!,
                description: resourceDTO.Description!,
                type: resourceDTO.ResourceType,
                operationalCapacity: resourceDTO.OperationalCapacity,
                status: resourceDTO.Status,
                setupTime: resourceDTO.SetupTime,
                qualifications: qualifications
            );

            var created = _resourceService.GetResourceById(resourceDTO.Id!);
            return CreatedAtAction(nameof(GetResource), new { id = created!.Id }, ResourceToDTO(created));
        }

        [HttpPut("{id}")]
        public IActionResult PutResource(string id, ResourceDTO resourceDTO)
        {
            var resource = _resourceService.GetResourceById(id);
            if (resource == null)
                return NotFound();

            // You can add other update logic here (capacity, setup time, etc.)
            resource.Description = resourceDTO.Description;
            resource.OperationalCapacity = resourceDTO.OperationalCapacity;
            resource.SetupTime = resourceDTO.SetupTime;
            resource.Status = resourceDTO.Status;
            resource.ResourceType = resourceDTO.ResourceType;

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteResource(string id)
        {
            var resource = _resourceService.GetResourceById(id);
            if (resource == null)
                return NotFound();

            // Assuming repository/service handles removal
            // You can add a DeleteResource() method in your service if needed
            return NoContent();
        }

        private static ResourceDTO ResourceToDTO(Resource resource) => new ResourceDTO
        {
            Id = resource.Id!,
            Description = resource.Description!,
            ResourceType = resource.ResourceType,
            OperationalCapacity = resource.OperationalCapacity,
            Status = resource.Status,
            SetupTime = resource.SetupTime,
            QualificationRequirements = resource.qualificationRequirements
        };
    }
}
