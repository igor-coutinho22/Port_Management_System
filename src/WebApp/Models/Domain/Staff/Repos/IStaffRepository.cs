using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Domain.Staff.Interfaces
{
    public interface IStaffRepository
    {
        Task AddAsync(Staff staff);
        Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber);
        Task<List<Staff>> GetAllAsync();
        Task<List<Staff>> GetByStatusAsync(StaffStatus status);
        Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode);
        Task UpdateAsync(Staff staff);
        Task DeleteAsync(string mecanographicNumber);
    }
}
