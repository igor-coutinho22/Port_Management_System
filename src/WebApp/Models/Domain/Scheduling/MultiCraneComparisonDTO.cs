using WebApp.Models.Application.DTOs;

public class MultiCraneComparisonResultDTO
{
    public SchedulingResultDTO SingleCrane { get; set; } = default!;
    public SchedulingResultDTO? MultiCrane { get; set; }

    // Convenience metrics
    public bool MultiCraneUsed => MultiCrane is not null && MultiCrane.TotalDelayMinutes < SingleCrane.TotalDelayMinutes;
    public double? DelayImprovementMinutes =>
        MultiCrane is null ? null : SingleCrane.TotalDelayMinutes - MultiCrane.TotalDelayMinutes;

    public double? CraneHoursSingle { get; set; }    // optional, if you want to compute
    public double? CraneHoursMulti { get; set; }     // from TotalCraneMinutes/60
}
