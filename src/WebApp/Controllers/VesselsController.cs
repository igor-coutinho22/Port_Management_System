using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Mappers;

namespace WebApp.Controllers
{
    [Authorize("RequireOfficer")]
    [ApiController]
    [Route("api/[controller]")]
    public class VesselsController : ControllerBase
    {
        private readonly IVesselService _vesselService;
        private readonly IVesselTypeService _vesselTypeService;

        public VesselsController(IVesselService vesselService, IVesselTypeService vesselTypeService)
        {
            _vesselService = vesselService;
            _vesselTypeService = vesselTypeService;
        }

        // ------------------------------------------------------------
        // Register a new vessel
        // ------------------------------------------------------------
        [HttpPost()]
        public async Task<IActionResult> RegisterVesselAsync([FromBody] VesselDTO dto, [FromQuery] string vesselTypeName)
        {
            try
            {
                var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(vesselTypeName);
                if (vesselType == null)
                    return NotFound($"Vessel type '{vesselTypeName}' not found.");

                var vessel = VesselMapper.MapToDomain(dto, vesselType!);
                await _vesselService.RegisterVesselAsync(vessel);

                var created = await _vesselService.GetVesselByIMOAsync(dto.IMO!);
                return CreatedAtRoute("GetByIMO", new { imo = created!.IMO }, VesselMapper.MapToDto(created));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ------------------------------------------------------------
        // Update an existing vessel
        // ------------------------------------------------------------
        [HttpPut("{imo}")]
        public async Task<IActionResult> UpdateVesselAsync(string imo, [FromBody] VesselDTO dto, [FromQuery] string vesselTypeName)
        {
            try
            {
                var vessel = await _vesselService.GetVesselByIMOAsync(imo);
                if (vessel == null)
                    return NotFound($"Vessel with IMO {imo} not found.");

                // Get the vessel type from the query parameter
                var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(vesselTypeName);
                if (vesselType == null)
                    return NotFound($"Vessel type '{vesselTypeName}' not found.");

                var updatedVessel = VesselMapper.MapToDomain(dto, vesselType);
                await _vesselService.UpdateVesselAsync(updatedVessel);
                return CreatedAtRoute("GetByIMO", new { imo = updatedVessel.IMO }, VesselMapper.MapToDto(updatedVessel));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ------------------------------------------------------------
        // Get by IMO
        // ------------------------------------------------------------
        [HttpGet("getByIMO/{imo}", Name = "GetByIMO")]
        public async Task<IActionResult> GetByIMOAsync(string imo)
            {
                var vessel = await _vesselService.GetVesselByIMOAsync(imo);
                if (vessel == null)
                    return NotFound($"Vessel with IMO {imo} not found.");

                return Ok(VesselMapper.MapToDto(vessel));
            }

        // ------------------------------------------------------------
        // Search by name or operator
        // ------------------------------------------------------------
        [HttpGet("searchByNameAndOperator")]
        public async Task<IActionResult> SearchAsync([FromQuery] string? name, [FromQuery] string? operatorName)
        {
            var results = await _vesselService.GetAllVesselsAsync();

            if (!string.IsNullOrWhiteSpace(name))
                results = results.Where(v => v.VesselName.Contains(name, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(operatorName))
                results = results.Where(v => v.OperatorName.Contains(operatorName, StringComparison.OrdinalIgnoreCase)).ToList();

            if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(operatorName))
                return BadRequest("At least one search parameter (name or operator) must be provided.");

            if (results.Count == 0)
                return NotFound("No vessels found matching the search criteria.");

            return Ok(results.Select(VesselMapper.MapToDto));
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet()]
        public async Task<IActionResult> GetAllVesselsAsync()
        {
            var vessels = await _vesselService.GetAllVesselsAsync();
            
            return Ok(vessels);
        }

        // ------------------------------------------------------------
        // Delete a vessel
        // ------------------------------------------------------------
        [HttpDelete("{imo}")]
        public async Task<IActionResult> DeleteVesselAsync(string imo)
        {
            try
            {
                await _vesselService.DeleteVesselAsync(imo);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}