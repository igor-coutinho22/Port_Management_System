using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VesselController : ControllerBase
    {
        private readonly IVesselService _vesselService;
        private readonly IVesselTypeService _vesselTypeService;

        public VesselController(IVesselService vesselService, IVesselTypeService vesselTypeService)
        {
            _vesselService = vesselService;
            _vesselTypeService = vesselTypeService;
        }

        // ------------------------------------------------------------
        // Register a new vessel
        // ------------------------------------------------------------
        [HttpPost()]
        public async Task<IActionResult> RegisterVesselAsync([FromBody] VesselDTO dto)
        {
            try
            {
                await _vesselService.RegisterVesselDTOAsync(dto);
                return CreatedAtRoute("GetByIMO", new { imo = dto.IMO }, dto);
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
        public async Task<IActionResult> UpdateVesselAsync(string imo, [FromBody] VesselDTO dto)
        {
            try
            {
                await _vesselService.UpdateVesselAsync(imo, dto.IMO, dto.VesselName, dto.OperatorName, await _vesselTypeService.GetVesselTypeByNameAsync(dto.VesselType) ?? throw new ArgumentException($"Vessel type '{dto.VesselType}' not recognized."), dto.Bays, dto.Rows, dto.Tiers, dto.RequiredCraneCount, dto.RequiredDockLength);

                var updated = await _vesselService.GetVesselByIMOAsync(imo);
                if (updated == null)
                    return NotFound();

                return Ok(MapToDto(updated));
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

            return Ok(MapToDto(vessel));
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

            return Ok(results.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllVesselsAsync()
        {
            var vessels = await _vesselService.GetAllVesselsAsync();
            
            return Ok(vessels);
        }

        private static VesselDTO MapToDto(Vessel v) =>
            new(
                v.IMO,
                v.VesselName,
                v.OperatorName,
                v.VesselType.Name,
                v.RequiredCraneCount,
                v.RequiredDockLength,
                v.Bays,
                v.Rows,
                v.Tiers
            );
    }
}
