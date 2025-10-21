using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VesselTypeController : ControllerBase
    {
        private readonly IVesselTypeService _vesselTypeService;

        public VesselTypeController(IVesselTypeService vesselTypeService)
        {
            _vesselTypeService = vesselTypeService;
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vesselTypes = await _vesselTypeService.GetAllVesselTypesAsync();
            return Ok(vesselTypes.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Get by exact name
        // ------------------------------------------------------------
        [HttpGet("{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(name);
            if (vesselType == null)
                return NotFound($"Vessel type '{name}' not found.");

            return Ok(MapToDto(vesselType));
        }

        // ------------------------------------------------------------
        // Search by partial name and description
        // ------------------------------------------------------------
        [HttpGet("search")]
        public async Task<IActionResult> SearchByName([FromQuery] string? name, [FromQuery] string? description)
        {
            IEnumerable<VesselType> results = await _vesselTypeService.GetAllVesselTypesAsync();

            if (!string.IsNullOrWhiteSpace(name))
                results = await _vesselTypeService.SearchVesselTypesByNameAsync(name);

            if (!string.IsNullOrWhiteSpace(description))
                results = await _vesselTypeService.SearchVesselTypesByDescriptionAsync(description);

            return Ok(results.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Add a new vessel type
        // ------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> AddVesselType([FromBody] VesselTypeDTO dto)
        {
            try
            {
                await _vesselTypeService.AddVesselTypeAsync(dto.Name, dto.Description, dto.MaxBays, dto.MaxRows, dto.MaxTiers);
                return CreatedAtAction(nameof(GetByName), new { name = dto.Name }, dto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ------------------------------------------------------------
        // Update an existing vessel type
        // ------------------------------------------------------------
        [HttpPut("{currentName}")]
        public async Task<IActionResult> UpdateVesselType(string currentName, [FromBody] VesselTypeDTO dto)
        {
            var existing = await _vesselTypeService.GetVesselTypeByNameAsync(currentName);
            if (existing == null)
                return NotFound($"Vessel type '{currentName}' not found.");

            try
            {
                await _vesselTypeService.UpdateVesselTypeAsync(currentName, dto.Name, dto.Description, dto.MaxBays, dto.MaxRows, dto.MaxTiers);
                var updated = await _vesselTypeService.GetVesselTypeByNameAsync(dto.Name);
                return Ok(MapToDto(updated!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private static VesselTypeDTO MapToDto(VesselType vt) =>
            new VesselTypeDTO(vt.Name, vt.Description, vt.MaxBays, vt.MaxRows, vt.MaxTiers);
    }
}
