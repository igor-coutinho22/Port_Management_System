public class DailyScheduleRequestDTO
{
    public DateOnly TargetDate { get; set; }
    public string Heuristic { get; set; } = default!;
}
