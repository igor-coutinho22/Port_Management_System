using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.Services.VesselTypeService;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Application.DTOs;
using System.Collections.Generic;
using System.Linq;
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
        public IActionResult GetAll()
        {
            var vesselTypes = _vesselTypeService.GetAllVesselTypes();
            return Ok(vesselTypes.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Get by exact name
        // ------------------------------------------------------------
        [HttpGet("{name}")]
        public IActionResult GetByName(string name)
        {
            var vesselType = _vesselTypeService.GetVesselTypeByName(name);
            if (vesselType == null)
                return NotFound($"Vessel type '{name}' not found.");

            return Ok(MapToDto(vesselType));
        }

        // ------------------------------------------------------------
        // Search by partial name and description
        // ------------------------------------------------------------
        [HttpGet("search")]
        public IActionResult SearchByName([FromQuery] string? name, [FromQuery] string? description)
        {
            IEnumerable<VesselType> results = _vesselTypeService.GetAllVesselTypes();

            if (!string.IsNullOrWhiteSpace(name))
                results = _vesselTypeService.SearchVesselTypesByName(name);

            if (!string.IsNullOrWhiteSpace(description))
                results = _vesselTypeService.SearchVesselTypesByDescription(description);

            return Ok(results.Select(MapToDto));
        }

        // ------------------------------------------------------------
        // Add a new vessel type
        // ------------------------------------------------------------
        [HttpPost]
        public IActionResult AddVesselType([FromBody] VesselTypeDTO dto)
        {
            try
            {
                _vesselTypeService.AddVesselType(dto.Name, dto.Description, dto.MaxBays, dto.MaxRows, dto.MaxTiers);
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
        public IActionResult UpdateVesselType(string currentName, [FromBody] VesselTypeDTO dto)
        {
            var existing = _vesselTypeService.GetVesselTypeByName(currentName);
            if (existing == null)
                return NotFound($"Vessel type '{currentName}' not found.");

            try
            {
                _vesselTypeService.UpdateVesselType(currentName, dto.Name, dto.Description, dto.MaxBays, dto.MaxRows, dto.MaxTiers);
                return Ok(MapToDto(_vesselTypeService.GetVesselTypeByName(dto.Name)!));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ------------------------------------------------------------
        // Mapping method
        // ------------------------------------------------------------
        private static VesselTypeDTO MapToDto(VesselType vt) =>
            new VesselTypeDTO(vt.Name, vt.Description, vt.MaxBays, vt.MaxRows, vt.MaxTiers);
    }
}
