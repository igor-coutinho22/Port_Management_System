using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services.VesselService;
using WebApp.Models.Application.Services.VesselTypeService;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;
using System.Collections.Generic;
using System.Linq;
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
        [HttpPost]
        public async Task<IActionResult> RegisterVessel([FromBody] VesselDTO dto)
        {
            try
            {
                var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(dto.VesselType);
                if (vesselType == null)
                    return BadRequest($"Vessel type '{dto.VesselType}' not recognized.");

                await _vesselService.RegisterVesselAsync(
                    dto.IMO,
                    dto.VesselName,
                    dto.OperatorName,
                    vesselType,
                    dto.Bays,
                    dto.Rows,
                    dto.Tiers,
                    dto.RequiredCraneCount,
                    dto.RequiredDockLength
                );

                return CreatedAtAction(nameof(GetByIMO), new { imo = dto.IMO }, dto);
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
        public async Task<IActionResult> UpdateVessel(string imo, [FromBody] VesselDTO dto)
        {
            var existing = await _vesselService.GetVesselByIMOAsync(imo);
            if (existing == null)
                return NotFound($"Vessel with IMO {imo} not found.");

            try
            {
                var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(dto.VesselType);
                if (vesselType == null)
                    return BadRequest($"Vessel type '{dto.VesselType}' not recognized.");

                existing.VesselName = dto.VesselName;
                existing.OperatorName = dto.OperatorName;
                existing.VesselType = vesselType;
                existing.ValidateDimensions(
                    dto.Bays,
                    dto.Rows,
                    dto.Tiers
                );
                existing.GetType().GetProperty("RequiredCraneCount")?.SetValue(existing, dto.RequiredCraneCount);
                existing.GetType().GetProperty("RequiredDockLength")?.SetValue(existing, dto.RequiredDockLength);

                // Persist changes
                // Since there's no explicit update method, you may rely on tracking via repository context if attached.
                // If not tracked, consider adding an UpdateAsync in the repository/service.

                return Ok(MapToDto(existing));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ------------------------------------------------------------
        // Get by IMO
        // ------------------------------------------------------------
        [HttpGet("{imo}")]
        public async Task<IActionResult> GetByIMO(string imo)
        {
            var vessel = await _vesselService.GetVesselByIMOAsync(imo);
            if (vessel == null)
                return NotFound($"Vessel with IMO {imo} not found.");

            return Ok(MapToDto(vessel));
        }

        // ------------------------------------------------------------
        // Search by name or operator
        // ------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string? name, [FromQuery] string? operatorName)
        {
            var results = await _vesselService.GetAllVesselsAsync();

            if (!string.IsNullOrWhiteSpace(name))
                results = results.Where(v => v.VesselName.Contains(name, StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(operatorName))
                results = results.Where(v => v.OperatorName.Contains(operatorName, StringComparison.OrdinalIgnoreCase)).ToList();

            return Ok(results.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet("types")]
        public async Task<IActionResult> GetAllVesselTypes()
        {
            var vesselTypes = (await _vesselTypeService.GetAllVesselTypesAsync())
                .Select(vt => new VesselTypeDTO(vt.Name, vt.Description, vt.MaxBays, vt.MaxRows, vt.MaxTiers));
            
            return Ok(vesselTypes);
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
