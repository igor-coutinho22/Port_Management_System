// File: WebApp/Models/Infrastructure/Repositories/IRepresentativeRepository.cs
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IRepresentativeRepository
    {
        Task<Representative?> GetByIdAsync(Guid id);
        Task<List<Representative>> GetByOrganizationIdAsync(Guid orgId);
        Task<List<Representative>> GetAllAsync();
        Task AddAsync(Representative rep);
        Task UpdateAsync(Representative rep);
        Task DeleteAsync(Representative rep);
    }
}