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
        Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, Guid? vesselTypeId);
        Task UpdateAsync(Guid id, DockDto dto);
    }

    public class DockService : IDockService
    {
        private readonly IDockRepository _dockRepository;
        private readonly IVesselTypeRepository _vesselTypeRepository;

        public DockService(IDockRepository dockRepository, IVesselTypeRepository vesselTypeRepository)
        {
            _dockRepository = dockRepository;
            _vesselTypeRepository = vesselTypeRepository;
        }

        public async Task<Dock> CreateAsync(DockDto dto)
        {
            var dock = new Dock(dto.Name, dto.Location, dto.LengthMeters, dto.DepthMeters, dto.MaxDraftMeters);

            foreach (var vtId in dto.AllowedVesselTypeIds)
            {
                var type = await _vesselTypeRepository.GetByIdAsync(vtId);
                if (type != null) dock.AllowVesselType(type);
            }

            await _dockRepository.AddAsync(dock);
            return dock;
        }

        public async Task<Dock?> GetByIdAsync(Guid id) =>
            await _dockRepository.GetByIdAsync(id);

        public async Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, Guid? vesselTypeId) =>
            await _dockRepository.SearchAsync(name, location, vesselTypeId);

        public async Task UpdateAsync(Guid id, DockDto dto)
        {
            var dock = await _dockRepository.GetByIdAsync(id)
                       ?? throw new KeyNotFoundException("Dock not found.");

            dock.Update(dto.Name, dto.Location, dto.LengthMeters, dto.DepthMeters, dto.MaxDraftMeters);
            dock.AllowedVesselTypes.Clear();

            foreach (var vtId in dto.AllowedVesselTypeIds)
            {
                var type = await _vesselTypeRepository.GetByIdAsync(vtId);
                if (type != null) dock.AllowVesselType(type);
            }

            await _dockRepository.UpdateAsync(dock);
        }
    }
}