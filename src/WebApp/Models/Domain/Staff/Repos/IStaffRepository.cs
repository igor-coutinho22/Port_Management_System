using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Domain.Staff.Interfaces
{
    public interface IStaffRepository
    {
        void Add(Staff staff);
        Staff? GetByMecanographicNumber(string mecanographicNumber);
        List<Staff> GetAll();
        List<Staff> GetByStatus(StaffStatus status);
        List<Staff> Search(string? name, StaffStatus? status, string? qualificationCode);
        void Update(Staff staff);
        void Delete(string mecanographicNumber);

        // Async versions
        Task AddAsync(Staff staff);
        Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber);
        Task<List<Staff>> GetAllAsync();
        Task<List<Staff>> GetByStatusAsync(StaffStatus status);
        Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode);
        Task UpdateAsync(Staff staff);
        Task DeleteAsync(string mecanographicNumber);
    }
}
