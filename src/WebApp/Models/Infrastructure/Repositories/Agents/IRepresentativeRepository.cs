using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IRepresentativeRepository
    {
        Task<Representative?> GetByIdAsync(Guid id);
        Task<IEnumerable<Representative>> ListByOrganizationAsync(Guid orgId, bool? active);

        Task<IEnumerable<Representative>> ListAllAsync(Guid? orgId, bool? active);

        Task AddAsync(Representative rep);
        Task UpdateAsync(Representative rep);
    }
}
