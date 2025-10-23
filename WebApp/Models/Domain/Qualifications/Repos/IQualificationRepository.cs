using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IQualificationRepository
    {
        Task<Qualification?> GetByIdAsync(Guid id);
        Task<Qualification?> GetByCodeAsync(string code);
        Task<IEnumerable<Qualification>> SearchAsync(string? code, string? name);
        Task AddAsync(Qualification qualification);
        Task UpdateAsync(Qualification qualification);
    }
}