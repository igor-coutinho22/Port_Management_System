using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IDockService
    {
        Task CreateAsync(Dock dock);
        Task<Dock?> GetByIdAsync(Guid id);
        Task<Dock?> GetByNameAsync(string name);
        Task<Dock?> GetByLocationAsync(string location);
        Task<List<Dock>> SearchByVesselTypeAsync(string vesselTypeName);
        Task<List<Dock>> SearchByLocationAsync(string location);
        Task<List<Dock>> SearchByNameAsync(string name);
        Task UpdateAsync(Dock dock);
        Task DeleteAsync(Guid id);
        Task<List<Dock>> GetAllAsync();
    }

}