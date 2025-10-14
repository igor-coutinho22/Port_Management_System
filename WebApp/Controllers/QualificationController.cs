using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QualificationController : ControllerBase
    {
        private readonly IQualificationService _service;

        public QualificationController(IQualificationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<QualificationDto>> Create([FromBody] QualificationDto dto)
        {
            var result = await _service.CreateAsync(dto.Code, dto.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<QualificationDto>> Update(Guid id, [FromBody] QualificationDto dto)
        {
            var result = await _service.UpdateAsync(id, dto.Name);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QualificationDto>>> Search([FromQuery] string? code, [FromQuery] string? name)
        {
            var results = await _service.SearchAsync(code, name);
            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QualificationDto>> GetById(Guid id)
        {
            var results = await _service.SearchAsync(null, null);
            var qualification = results.FirstOrDefault(q => q.Id == id);
            if (qualification == null)
                return NotFound();
            return Ok(qualification);
        }
    }
}
