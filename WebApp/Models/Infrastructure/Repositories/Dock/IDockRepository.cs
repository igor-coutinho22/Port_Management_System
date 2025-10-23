using WebApp.Models.Domain.Docks;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IDockRepository
    {
        Task<Dock?> GetByIdAsync(Guid id);
        Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, Guid? vesselTypeId);
        Task AddAsync(Dock dock);
        Task UpdateAsync(Dock dock);
    }
}