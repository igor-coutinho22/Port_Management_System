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
        public IActionResult RegisterVessel([FromBody] VesselDTO dto)
        {
            try
            {
                var vesselType = _vesselTypeService.GetVesselTypeByName(dto.VesselType);
                if (vesselType == null)
                    return BadRequest($"Vessel type '{dto.VesselType}' not recognized.");

                _vesselService.RegisterVessel(
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
        public IActionResult UpdateVessel(string imo, [FromBody] VesselDTO dto)
        {
            var existing = _vesselService.GetVesselByIMO(imo);
            if (existing == null)
                return NotFound($"Vessel with IMO {imo} not found.");

            try
            {
                var vesselType = _vesselTypeService.GetVesselTypeByName(dto.VesselType);
                if (vesselType == null)
                    return BadRequest($"Vessel type '{dto.VesselType}' not recognized.");

                // update mutable fields (not IMO)
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
        public IActionResult GetByIMO(string imo)
        {
            var vessel = _vesselService.GetVesselByIMO(imo);
            if (vessel == null)
                return NotFound($"Vessel with IMO {imo} not found.");

            return Ok(MapToDto(vessel));
        }

        // ------------------------------------------------------------
        // Search by name or operator
        // ------------------------------------------------------------
        [HttpGet]
        public IActionResult Search([FromQuery] string? name, [FromQuery] string? operatorName)
        {
            IEnumerable<Vessel> results = _vesselService.GetAllVessels();

            if (!string.IsNullOrWhiteSpace(name))
                results = results.Where(v => v.VesselName.Contains(name, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(operatorName))
                results = results.Where(v => v.OperatorName.Contains(operatorName, StringComparison.OrdinalIgnoreCase));

            return Ok(results.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Get all vessel types
        // ------------------------------------------------------------
        [HttpGet("types")]
        public IActionResult GetAllVesselTypes()
        {
            var vesselTypes = _vesselTypeService.GetAllVesselTypes()
                .Select(vt => new VesselTypeDTO(vt.Name, vt.Description, vt.MaxBays, vt.MaxRows, vt.MaxTiers));
            
            return Ok(vesselTypes);
        }


        // ------------------------------------------------------------
        // Helper mapping method
        // ------------------------------------------------------------
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
