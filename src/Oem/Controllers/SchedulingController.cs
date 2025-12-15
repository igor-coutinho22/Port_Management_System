using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Oem.Models.Domain.Scheduling.Services;

[Authorize("RequireOperator")]
[ApiController]
[Route("api/[controller]")]
public class SchedulingController : ControllerBase
{
    private readonly IHeuristicScheduleService _scheduleService;

    public SchedulingController(IHeuristicScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpPost("daily")]
    public async Task<IActionResult> GenerateDailySchedule(
        [FromBody] DailyScheduleRequestDTO request,
        CancellationToken cancellationToken)
    {
        if (request.TargetDate == default)
            return BadRequest("TargetDate is required.");
        if (string.IsNullOrWhiteSpace(request.Heuristic))
            return BadRequest("Heuristic is required.");

        var result = await _scheduleService.GenerateDailyScheduleAsync(
            request.TargetDate,
            request.Heuristic,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("daily-with-multi-crane")]
    public async Task<IActionResult> GenerateDailyScheduleWithMultiCrane(
    [FromBody] DailyScheduleRequestDTO request,
    CancellationToken cancellationToken)
    {
        if (request.TargetDate == default)
            return BadRequest("TargetDate is required.");
        if (string.IsNullOrWhiteSpace(request.Heuristic))
            return BadRequest("Heuristic is required.");

        var result = await _scheduleService.GenerateDailyScheduleWithMultiCraneAsync(
            request.TargetDate,
            request.Heuristic,
            cancellationToken);

        return Ok(result);
    }

    /*[HttpGet("whoami")]
    [Authorize] // Allow any authenticated user
    public IActionResult WhoAmI()
    {
        return Ok(new
        {
            Name = User.Identity?.Name,
            Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        });
    }*/

}
