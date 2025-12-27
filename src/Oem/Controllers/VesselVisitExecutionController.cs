using Microsoft.AspNetCore.Mvc;
using Oem.Models.Context;
using Oem.Models.Domain.VesselVisitExecutions;
using Oem.Models.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Oem.Models.Application.Mappers;

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [Authorize("RequireOperator")]
    [ApiController]
    public class VesselVisitExecutionController : ControllerBase
    {
        private readonly IVesselVisitExecutionService _service;
        private readonly IWebAppService _webAppService;

        public VesselVisitExecutionController(IVesselVisitExecutionService service, IWebAppService webAppService)
        {
            _service = service;
            _webAppService = webAppService;

        }

        [HttpPost("Create")]
        public async Task<ActionResult> Create([FromBody] CreateVesselVisitExecutionDTO dto)
        {
            try
            {
                if (dto == null) return BadRequest("Invalid data.");

                if (dto.VesselVisitId == Guid.Empty)
                    return BadRequest("VesselVisitId is required.");

                // 1. Fetch the actual VVN object
                var vvnDto = await _webAppService.GetVesselVisitByIdAsync(dto.VesselVisitId);

                // 2. Check if it exists
                if (vvnDto == null)
                    return BadRequest($"Vessel Visit with ID '{dto.VesselVisitId}' does not exist or could not be retrieved.");

                var isIMOValid = await _webAppService.IsVesselValidAsync(dto.VesselIMO);
                if (!isIMOValid)
                    return BadRequest("Vessel IMO is not valid.");

                if (vvnDto.VesselIMO != dto.VesselIMO)
                    return BadRequest("Vessel IMO does not match the one in the Vessel Visit Notification.");

                dto.CreatedBy = User?.Identity?.Name ?? "System";

                var vve = VesselVisitExecutionMapper.ToDomain(dto);

                await _service.CreateVesselVisitExecutionAsync(vve);

                return CreatedAtAction(nameof(GetById), new { id = vve.Id }, VesselVisitExecutionMapper.ToDTO(vve));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VesselVisitExecutionDTO>> GetById(Guid id)
        {
            var vvn = await _service.GetVesselVisitExecutionByIdAsync(id);
            if (vvn == null)
                return BadRequest("Vessel Visit Execution not found.");

            return Ok(VesselVisitExecutionMapper.ToDTO(vvn));
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<VesselVisitExecutionDTO>>> GetAll()
        {
            var vvnList = await _service.GetAllVesselVisitExecutionsAsync();
            var dtoList = vvnList.Select(VesselVisitExecutionMapper.ToDTO);
            return Ok(dtoList);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var vvn = await _service.GetVesselVisitExecutionByIdAsync(id);
                if (vvn == null)
                    return BadRequest("Vessel Visit Execution not found.");

                await _service.DeleteVesselVisitExecutionAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
