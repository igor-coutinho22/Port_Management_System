using Oem.Models.Domain.Scheduling;

namespace Oem.Models.Domain.Scheduling.Services;
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
