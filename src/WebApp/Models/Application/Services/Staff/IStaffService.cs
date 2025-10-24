using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IStaffService
    {
        Task<StaffDto> RegisterAsync(string mecanographicNumber, string shortName, string email, string phone, string daysOfWeek, TimeSpan start, TimeSpan end);
        Task<IEnumerable<StaffDto>> SearchAsync(string? name, string? status);
        Task ChangeStatusAsync(Guid id, string status);
        Task AddQualificationAsync(Guid staffId, Guid qualificationId);
    }
}
