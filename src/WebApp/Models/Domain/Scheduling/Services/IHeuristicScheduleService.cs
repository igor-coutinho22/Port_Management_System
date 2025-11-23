using WebApp.Models.Domain.Scheduling;

namespace WebApp.Models.Domain.Scheduling.Services;
public interface IHeuristicScheduleService
{
    Task<SchedulingResult> GenerateDailyScheduleAsync(
        DateOnly targetDate,
        string heuristicName,
        CancellationToken cancellationToken = default);

    Task<MultiCraneComparisonResultDTO> GenerateDailyScheduleWithMultiCraneAsync(
        DateOnly targetDate,
        string heuristicName,
        CancellationToken cancellationToken = default);

}
