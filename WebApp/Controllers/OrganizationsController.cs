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

        [HttpPost]
        public async Task<ActionResult<OrganizationDto>> Create([FromBody] CreateOrganizationRequest req)
        {
            var org = await _service.CreateAsync(req);
            return CreatedAtAction(nameof(GetById), new { id = org.Id }, org);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrganizationDto>> GetById(Guid id)
            => Ok(await _service.GetAsync(id));
    }
}
