using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _service;
        public OrganizationsController(IOrganizationService service) => _service = service;

        // POST /api/organizations
        [HttpPost]
        public async Task<ActionResult<OrganizationDto>> Create([FromBody] CreateOrganizationRequest req)
        {
            var org = await _service.CreateAsync(req);
            return CreatedAtAction(nameof(GetById), new { id = org.Id }, org);
        }

        // GET /api/organizations/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrganizationDto>> GetById(Guid id)
            => Ok(await _service.GetAsync(id));

        // NOVO: GET /api/organizations?name=&taxNumber=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrganizationDto>>> List(
            [FromQuery] string? name, [FromQuery] string? taxNumber)
            => Ok(await _service.ListAsync(name, taxNumber));

        // NOVO: PUT /api/organizations/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<OrganizationDto>> Update(Guid id, [FromBody] UpdateOrganizationRequest req)
            => Ok(await _service.UpdateAsync(id, req));
    }
}
