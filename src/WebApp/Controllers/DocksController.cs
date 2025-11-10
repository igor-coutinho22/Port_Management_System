using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocksController : ControllerBase
    {
        private readonly IDockService _service;
        private readonly IVesselTypeService _vesselTypeService;

        public DocksController(IDockService service, IVesselTypeService vesselTypeService)
        {
            _service = service;
            _vesselTypeService = vesselTypeService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DockDto dto)
        {
            try
            {
                if (dto.AllowedVesselTypes == null || dto.AllowedVesselTypes.Count == 0)
                {
                    return BadRequest("At least one allowed vessel type must be specified.");
                }

                // Fetch vessel types sequentially to avoid DbContext concurrency issues
                var vt = new List<VesselType>();
                foreach (var vesselTypeName in dto.AllowedVesselTypes)
                {
                    var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(vesselTypeName);
                    if (vesselType == null)
                    {
                        return BadRequest($"Vessel type '{vesselTypeName}' not found.");
                    }
                    vt.Add(vesselType);
                }

                var dock = DockMapper.MapToDomain(dto, vt);
                await _service.CreateAsync(dock);

                var created = await _service.GetByIdAsync(dock.Id);
                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, DockMapper.MapToDto(created));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DockDto dto)
        {
            try
            {
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                    return NotFound($"Dock with ID {id} not found.");

                if (dto.AllowedVesselTypes == null || dto.AllowedVesselTypes.Count == 0)
                {
                    return BadRequest("At least one allowed vessel type must be specified.");
                }

                // Fetch vessel types sequentially to avoid DbContext concurrency issues
                var vt = new List<VesselType>();
                foreach (var vesselTypeName in dto.AllowedVesselTypes)
                {
                    var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(vesselTypeName);
                    if (vesselType == null)
                    {
                        return BadRequest($"Vessel type '{vesselTypeName}' not found.");
                    }
                    vt.Add(vesselType);
                }
                
                // Update the existing dock with new data
                DockMapper.UpdateFromDto(existing, dto, vt);
                await _service.UpdateAsync(existing);
                return Ok(DockMapper.MapToDto(existing));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var dock = await _service.GetByIdAsync(id);
            return dock == null ? NotFound($"Dock with ID {id} not found.") : Ok(DockMapper.MapToDto(dock));
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchByNameLocationAndOrVesselTypeName([FromQuery] string? name, [FromQuery] string? location, [FromQuery] string? vesselTypeName)
        {
            if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(location) && string.IsNullOrWhiteSpace(vesselTypeName))
                return BadRequest("At least one search parameter (name, location, or vessel type name) must be provided.");

            // Start with all docks
            var results = await _service.GetAllAsync();

            // Apply filters progressively (AND logic)
            if (!string.IsNullOrWhiteSpace(name))
                results = results.Where(d => d.Name.Contains(name, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(location))
                results = results.Where(d => d.Location.Contains(location, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(vesselTypeName))
                results = results.Where(d => d.AllowedVesselTypes.Any(vt => vt.Name.Contains(vesselTypeName, StringComparison.OrdinalIgnoreCase))).ToList();

            if (results.Count == 0)
                return NotFound("No docks found matching the search criteria.");

            return Ok(results.Select(DockMapper.MapToDto));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var docks = await _service.GetAllAsync();
            return Ok(docks);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}