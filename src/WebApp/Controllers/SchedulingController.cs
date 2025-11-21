using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Scheduling.Interfaces;
using WebApp.Models.Application.Mappers;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulingController : ControllerBase
    {
        private readonly IHeuristicScheduleService _heuristicService;

        public SchedulingController(IHeuristicScheduleService heuristicService)
        {
            _heuristicService = heuristicService;
        }

        [HttpGet("heuristic")]
        [AllowAnonymous]  // Allow testing without authentication
        public IActionResult GetHeuristicSchedule()
        {
            // Use demo data from Prolog file (vessels parameter = null)
            var result = _heuristicService.ComputeSchedule(null);
            var dto = SchedulingResultMapper.ToDTO(result);
            return Ok(dto);
        }
    }
}