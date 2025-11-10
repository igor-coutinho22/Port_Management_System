/*using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Scheduling.Interfaces;
namespace PortApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchedulingController{
    private readonly IHeuristicScheduleService _heuristicService;
    public SchedulingController(
        IHeuristicScheduleService heuristicService
        )
    {
        _heuristicService = heuristicService;
    }

    [HttpGet]
    public IActionResult GetSchedule([FromQuery] string mode = "heuristic")
    {
        var vessels = GetTodayVessels();
        var result = _heuristicService.ComputeSchedule(vessels);
        return Ok(result);
    }
}*/