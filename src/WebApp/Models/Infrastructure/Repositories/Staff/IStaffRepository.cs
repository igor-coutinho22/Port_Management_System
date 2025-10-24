using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IStaffRepository
    {
        Task<Staff?> GetByIdAsync(Guid id);
        Task<IEnumerable<Staff>> SearchAsync(string? name, string? status, string? qualificationCode);
        Task AddAsync(Staff staff);
        Task UpdateAsync(Staff staff);
    }
}
