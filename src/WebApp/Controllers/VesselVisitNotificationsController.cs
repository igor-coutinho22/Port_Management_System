using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VesselVisitNotificationController : ControllerBase
    {
        private readonly IVesselVisitNotificationService _service;
        private readonly ILogger<VesselVisitNotificationController> _logger;

        public VesselVisitNotificationController(
            IVesselVisitNotificationService service,
            ILogger<VesselVisitNotificationController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/vesselvisitnotification
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult> GetAllAsync()
        {
            var visits = await _service.GetAllAsync();
            return Ok(visits);
        }

        // GET: api/vesselvisitnotification/search
        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VesselVisitNotificationDTO>>> SearchAsync(
            [FromQuery] string? vesselIMO,
            [FromQuery] string? status,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            try
            {
                var filter = VesselVisitNotificationMapper.ToFilterDTO(
                    vesselIMO, status, fromDate, toDate);

                var visits = await _service.SearchAsync(filter);
                return Ok(visits);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Unexpected error while searching Vessel Visit Notifications.");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/vesselvisitnotification/{id}
        [HttpGet("{id:guid}", Name = "GetByIdAsync")]
        public async Task<ActionResult> GetByIdAsync(Guid id)
        {
            var visit = await _service.GetByIdAsync(id);
            if (visit == null)
                return NotFound($"Vessel Visit Notification with ID {id} not found.");

            return Ok(VesselVisitNotificationMapper.ToDTO(visit));
        }

        // POST: api/vesselvisitnotification
        [HttpPost]
        public async Task<ActionResult> CreateAsync(
            [FromBody] VesselVisitNotificationDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            try
            {
                var vesselvisitnotification = VesselVisitNotificationMapper.ToEntity(dto);
                await _service.CreateAsync(vesselvisitnotification);

                var created = await _service.GetByIdAsync(vesselvisitnotification.Id);
                return CreatedAtRoute("GetByIdAsync", new { id = created!.Id }, VesselVisitNotificationMapper.ToDTO(created));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argument validation failed while creating Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating Vessel Visit Notification.");
                return StatusCode(500, "Internal server error");
            }
        }

        

        // PUT: api/vesselvisitnotification/{id}/approve
        [HttpPut("{id:guid}/approve")]
        public async Task<IActionResult> ApproveAsync(Guid id, [FromQuery] Guid dockId)
        {
            try
            {
                await _service.ApproveAsync(id, dockId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/vesselvisitnotification/{id}/reject
        [HttpPut("{id:guid}/reject")]
        public async Task<IActionResult> RejectAsync(Guid id, [FromBody] RejectReasonDTO dto)
        {
            try
            {
                await _service.RejectAsync(id, dto.Reason);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id:guid}/addLoadingManifest")]
        public async Task<ActionResult> AddLoadingManifestAsync(Guid id, [FromBody] CargoManifestDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            if (dto.Type != CargoManifestType.Loading.ToString())
                return BadRequest("Only Loading Manifests can be added via this endpoint.");

            try
            {
                var manifest = CargoManifestsMapper.ToEntity(dto);
                await _service.AddLoadingManifestAsync(id, manifest);

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding Loading Manifest to Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}/removeLoadingManifest")]
        public async Task<ActionResult> RemoveLoadingManifestAsync(Guid id)
        {
            var vvn = await _service.GetByIdAsync(id);
            if (vvn == null)
                return NotFound("Vessel Visit Notification not found.");
            
            if (vvn.LoadingManifest == null)
                return BadRequest("No Loading Manifest to remove.");

            try
            {
                await _service.RemoveLoadingManifestAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while removing Loading Manifest from Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:guid}/addUnloadingManifest")]
        public async Task<ActionResult> AddUnloadingManifestAsync(Guid id, [FromBody] CargoManifestDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            if (dto.Type != CargoManifestType.Unloading.ToString())
                return BadRequest("Only Unloading Manifests can be added via this endpoint.");

            try
            {
                var manifest = CargoManifestsMapper.ToEntity(dto);
                await _service.AddUnloadingManifestAsync(id, manifest);

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding Unloading Manifest to Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}/removeUnloadingManifest")]
        public async Task<ActionResult> RemoveUnloadingManifestAsync(Guid id)
        {
            var vvn = await _service.GetByIdAsync(id);
            if (vvn == null)
                return NotFound("Vessel Visit Notification not found.");
            
            if (vvn.UnloadingManifest == null)
                return BadRequest("No Unloading Manifest to remove.");

            try
            {
                await _service.RemoveUnloadingManifestAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while removing Unloading Manifest from Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id:guid}/addCrewMember")]
        public async Task<ActionResult> AddCrewMemberAsync(Guid id, [FromBody] CrewMemberDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            try
            {
                var crewMember = CrewMapper.ToEntity(dto);
                await _service.AddCrewMemberAsync(id, crewMember);

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding Crew Member to Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}/removeCrewMember/{citizenId}")]
        public async Task<ActionResult> RemoveCrewMemberAsync(Guid id, string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Citizen ID cannot be empty.");

            var vvn = await _service.GetByIdAsync(id);
            if (vvn == null)
                return NotFound("Vessel Visit Notification not found.");

            if (vvn.Crew.Count == 0)
                return BadRequest("No Crew Members to remove.");

            try
            {
                await _service.RemoveCrewMemberAsync(id, citizenId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while removing Crew Member from Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:guid}/updateWhileInProgress")]
        public async Task<IActionResult> UpdateWhileInProgress(Guid id, [FromBody] VesselVisitNotificationUpdateDTO dto)
        {
            if (dto == null)
                return BadRequest("Request body cannot be empty.");

            try
            {
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                    return NotFound("Vessel Visit Notification not found.");

                // Only allow update if status is InProgress
                if (existing.Status != VesselVisitStatus.InProgress)
                {
                    throw new InvalidOperationException("Vessel Visit Notification can only be edited while status is 'InProgress'.");
                }

                VesselVisitNotificationMapper.UpdateFromDto(existing, dto);
                await _service.UpdateAsync(id, existing);

                // Return the updated entity
                var result = await _service.GetByIdAsync(id);
                return Ok(VesselVisitNotificationMapper.ToDTO(result!));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating Vessel Visit Notification.");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            try
            {
                await _service.DeleteVesselAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
