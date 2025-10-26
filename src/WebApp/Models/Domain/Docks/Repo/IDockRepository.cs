using WebApp.Models.Domain.Docks;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IDockRepository
    {
        Task<Dock?> GetByIdAsync(Guid id);
        Task<Dock?> GetByNameAsync(string name);
        Task<Dock?> GetByLocationAsync(string location);
        Task<List<Dock>> SearchByVesselTypeAsync(string vesselTypeName);
        Task<List<Dock>> SearchByLocationAsync(string location);
        Task<List<Dock>> SearchByNameAsync(string name);
        Task<List<Dock>> GetAllAsync();
        Task AddAsync(Dock dock);
        Task UpdateAsync(Dock dock);
        Task DeleteAsync(Dock dock);
    }
}