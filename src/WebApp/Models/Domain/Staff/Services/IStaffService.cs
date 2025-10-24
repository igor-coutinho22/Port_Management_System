using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Domain.Staff.Interfaces
{
    public interface IStaffService
    {
        Task RegisterStaffAsync(string mecanographicNumber, string shortName, string email, string phone,
            StaffStatus status, string operationalWindow, HashSet<Qualification> qualifications);

        Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber);
        Task<List<Staff>> GetAllAsync();
        Task<List<Staff>> GetByStatusAsync(StaffStatus status);
        Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode);

        Task UpdateAsync(Staff staff);
        Task ActivateAsync(string mecanographicNumber);
        Task DeactivateAsync(string mecanographicNumber);
    }
}
