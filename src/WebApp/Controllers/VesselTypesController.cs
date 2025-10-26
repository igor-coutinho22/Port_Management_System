using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Vessel;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VesselTypesController : ControllerBase
    {
        private readonly IVesselTypeService _vesselTypeService;

        public VesselTypesController(IVesselTypeService vesselTypeService)
        {
            _vesselTypeService = vesselTypeService;
        }

        // ------------------------------------------------------------
        // Add a new vessel type
        // ------------------------------------------------------------
        [HttpPost()]
        public async Task<IActionResult> AddVesselType([FromBody] VesselTypeDTO dto)
        {
            try
            {
                var vesselType = VesselTypeMapper.MapToDomain(dto);
                await _vesselTypeService.AddVesselTypeAsync(vesselType);

                var created = await _vesselTypeService.GetVesselTypeByNameAsync(dto.Name!);
                return CreatedAtAction(nameof(GetByName), new { name = created!.Name }, VesselTypeMapper.MapToDto(created));
            }
            catch (ArgumentException ex)
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
            try
            {
                var existing = await _vesselTypeService.GetVesselTypeByNameAsync(currentName);
                if (existing == null)
                    return NotFound($"Vessel type '{currentName}' not found.");

                // Use the update-specific mapper that doesn't add to static registry
                var updatedVesselType = VesselTypeMapper.MapToDomainForUpdate(dto);

                await _vesselTypeService.UpdateVesselTypeAsync(updatedVesselType);
                return CreatedAtAction(nameof(GetByName), new { name = updatedVesselType.Name }, VesselTypeMapper.MapToDto(updatedVesselType));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            }

        // ------------------------------------------------------------
        // Get by exact name
        // ------------------------------------------------------------
        [HttpGet("GetByName/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(name);
            if (vesselType == null)
                return NotFound($"Vessel type '{name}' not found.");

            return Ok(VesselTypeMapper.MapToDto(vesselType));
        }

        // ------------------------------------------------------------
        // Search by partial name and description
        // ------------------------------------------------------------
        [HttpGet()]
        public async Task<IActionResult> SearchByNameAndOrDescription([FromQuery] string? name, [FromQuery] string? description)
        {
            var results = await _vesselTypeService.GetAllVesselTypesAsync();

            if (!string.IsNullOrWhiteSpace(name))
                results = await _vesselTypeService.SearchVesselTypesByNameAsync(name);

            if (!string.IsNullOrWhiteSpace(description))
                results = await _vesselTypeService.SearchVesselTypesByDescriptionAsync(description);

            if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(description))
                return BadRequest("At least one search parameter (name or description) must be provided.");

            if (results.Count == 0)
                return NotFound("No vesselTypes found matching the search criteria.");

           return Ok(results.Select(VesselTypeMapper.MapToDto));
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var vesselTypes = await _vesselTypeService.GetAllVesselTypesAsync();
            return Ok(vesselTypes.Select(VesselTypeMapper.MapToDto));
        }
        // ------------------------------------------------------------
        // Delete a vessel type
        // ------------------------------------------------------------
        [HttpDelete("{name}")]
        public async Task<IActionResult> DeleteVesselType(string name)
        {
            try
            {
                await _vesselTypeService.DeleteVesselTypeAsync(name);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
