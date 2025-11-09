namespace WebApp.Controllers

[ApiController]
[Route("api/[controller]")]
public class SchedulingController : ControllerBase
{
    private readonly IHeuristicScheduleService _heuristicService;
    private readonly IOptimalScheduleService _optimalService;

    public SchedulingController(
        IHeuristicScheduleService heuristicService,
        IOptimalScheduleService optimalService)
    {
        _heuristicService = heuristicService;
        _optimalService = optimalService;
    }

    [HttpGet]
    public IActionResult GetSchedule([FromQuery] string mode = "heuristic")
    {
        var vessels = GetTodayVessels(); // hypothetical data source
        var result = mode == "optimal"
            ? _optimalService.ComputeSchedule(vessels)
            : _heuristicService.ComputeSchedule(vessels);

        return Ok(result);
    }
}