namespace WebApp.Models.Application.DTOs
{
    public record StaffDto(
        Guid Id,
        string MecanographicNumber,
        string ShortName,
        string Email,
        string Phone,
        string Status,
        string DaysOfWeek,
        string StartTime,
        string EndTime
    );
}
