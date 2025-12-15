using Microsoft.AspNetCore.Mvc;
using Oem.Models.Application.Services;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Models.DTOs.OperationPlans;
using Oem.Models.Mappers;

namespace Oem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OperationPlanController : ControllerBase
    {
        private readonly IOperationPlanService _service;
        private readonly IWebAppService _webAppService;

        public OperationPlanController(IOperationPlanService service, IWebAppService webAppService)
        {
            _service = service;
            _webAppService = webAppService;
        }

        [HttpPost]
        public async Task<ActionResult> SavePlan([FromBody] CreateOperationPlanDTO request)
        {
            try
            {
                var visits = await _webAppService.GetApprovedVisitsForDateAsync(request.ScheduleDate);
                var visitMap = visits.ToDictionary(v => v.Id);

                var plan = OperationPlanMapper.ToDomain(request, visitMap);
                await _service.SavePlanAsync(plan);

                var created = await _service.GetPlanByIdAsync(request.Id);
                return CreatedAtRoute(nameof(GetPlanById), new { id = created!.Id }, OperationPlanMapper.ToDto(created));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{date}")]
        public async Task<ActionResult> GetPlanByDate(string date)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
            {
                return BadRequest("Invalid date format. Use YYYY-MM-DD.");
            }

            var plan = await _service.GetPlanByDateAsync(parsedDate);
            if (plan == null)
            {
                return NotFound($"No operation plan found for {date}");
            }

            return Ok(OperationPlanMapper.ToDto(plan));
        }

        [HttpGet("GetById/{id}")]
        public async Task<ActionResult> GetPlanById(Guid id)
        {
            var plan = await _service.GetPlanByIdAsync(id);
            if (plan == null)
            {
                return NotFound($"No operation plan found for ID {id}");
            }

            return Ok(OperationPlanMapper.ToDto(plan));
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeletePlan(Guid Id)
        {
            try
            {
                await _service.DeletePlanAsync(Id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}