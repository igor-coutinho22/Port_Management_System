using Microsoft.AspNetCore.Mvc;
using Oem.Models.Context;
using Oem.Models.Domain.VesselVisitExecutions;
using Oem.Models.DTOs.VesselVisitExecutions;

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VesselVisitExecutionController : ControllerBase
    {
        private readonly OemContext _context;

        public VesselVisitExecutionController(OemContext context)
        {
            _context = context;
        }

        [HttpPost("Create")]
        public async Task<ActionResult> Create([FromBody] CreateVesselVisitExecutionDTO dto)
        {
            if (dto == null) return BadRequest("Invalid data.");

            // Basic validation
            if (dto.VesselVisitId == Guid.Empty)
                return BadRequest("VesselVisitId is required.");

            // Check if already exists? 
            // Maybe we want to allow multiple records (e.g. phases)? 
            // US 4.1.7 says "create a VVE record... so actual start... can be logged". 
            // Implies one per visit usually, but let's allow creation.

            var entity = new VesselVisitExecution(
                dto.VesselVisitId, 
                dto.VesselIdentifier, 
                dto.ActualArrivalTime, 
                dto.CreatedBy
            );

            _context.VesselVisitExecutions.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Vessel Visit Execution created successfully.", Id = entity.Id });
        }
    }
}
