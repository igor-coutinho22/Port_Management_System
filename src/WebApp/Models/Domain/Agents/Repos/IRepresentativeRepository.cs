// File: WebApp/Models/Infrastructure/Repositories/IRepresentativeRepository.cs
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IRepresentativeRepository
    {
        Task<Representative?> GetByIdAsync(Guid id);
        Task<IEnumerable<Representative>> GetByOrganizationAsync(Guid orgId);
        Task<IEnumerable<Representative>> GetAllAsync(Guid? orgId = null, bool? active = null);
        Task AddAsync(Representative rep);
        Task UpdateAsync(Representative rep);
        Task DeleteAsync(Representative rep);
    }
}