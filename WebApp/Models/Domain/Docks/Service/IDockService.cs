using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IDockService
    {
        Task<Dock> CreateAsync(DockDto dto);
        Task<Dock?> GetByIdAsync(Guid id);
        Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, string? vesselTypeName);
        Task UpdateAsync(Guid id, DockDto dto);
    }

}