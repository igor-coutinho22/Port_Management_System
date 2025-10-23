using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services;
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

            foreach (var vtName in dto.AllowedVesselTypes)
            {
                var type = await _vesselTypeRepository.GetVesselTypeByNameAsync(vtName);
                if (type != null) dock.AllowVesselType(type);
            }

            await _dockRepository.AddAsync(dock);
            return dock;
        }

        public async Task<Dock?> GetByIdAsync(Guid id) =>
            await _dockRepository.GetByIdAsync(id);

        public async Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, string? vesselTypeName) =>
            await _dockRepository.SearchAsync(name, location, vesselTypeName);

        public async Task UpdateAsync(Guid id, DockDto dto)
        {
            var dock = await _dockRepository.GetByIdAsync(id)
                       ?? throw new KeyNotFoundException("Dock not found.");

            dock.Update(dto.Name, dto.Location, dto.LengthMeters, dto.DepthMeters, dto.MaxDraftMeters);
            dock.AllowedVesselTypes.Clear();

            foreach (var vtName in dto.AllowedVesselTypes)
            {
                var type = await _vesselTypeRepository.GetVesselTypeByNameAsync(vtName);
                if (type != null) dock.AllowVesselType(type);
            }

            await _dockRepository.UpdateAsync(dock);
        }
    }