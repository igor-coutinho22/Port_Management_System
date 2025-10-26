using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api")]
    public class RepresentativesController : ControllerBase
    {
        private readonly IRepresentativeService _svc;
        public RepresentativesController(IRepresentativeService svc) => _svc = svc;

        [HttpPost("organizations/{orgId:guid}/representatives")]
        public async Task<ActionResult<RepresentativeDto>> Create(Guid orgId, [FromBody] CreateRepresentativeRequest req)
            => Created("", await _svc.CreateAsync(orgId, req));

        [HttpPut("representatives/{id:guid}")]
        public async Task<ActionResult<RepresentativeDto>> Update(Guid id, [FromBody] UpdateRepresentativeRequest req)
            => Ok(await _svc.UpdateAsync(id, req));

        [HttpPut("representatives/{id:guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid id) { await _svc.SetActiveAsync(id, false); return NoContent(); }

        [HttpPut("representatives/{id:guid}/activate")]
        public async Task<IActionResult> Activate(Guid id) { await _svc.SetActiveAsync(id, true); return NoContent(); }

        [HttpGet("organizations/{orgId:guid}/representatives")]
        public async Task<ActionResult<IEnumerable<RepresentativeDto>>> List(Guid orgId, [FromQuery] bool? active)
            => Ok(await _svc.ListAsync(orgId, active));

        [HttpGet("representatives")]
        public async Task<ActionResult<IEnumerable<RepresentativeDto>>> ListAll(
            [FromQuery] Guid? orgId, [FromQuery] bool? active)
            => Ok(await _svc.ListAllAsync(orgId, active));

    }
}
