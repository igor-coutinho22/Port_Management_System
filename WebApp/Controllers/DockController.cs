using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DockController : ControllerBase
    {
        private readonly IDockService _service;

        public DockController(IDockService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DockDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var dock = await _service.GetByIdAsync(id);
            return dock == null ? NotFound() : Ok(dock);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? name, [FromQuery] string? location, [FromQuery] string vesselTypeName)
        {
            var docks = await _service.SearchAsync(name, location, vesselTypeName);
            return Ok(docks);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DockDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return Ok(new { Message = "Dock updated successfully." });
        }
    }
}