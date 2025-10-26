using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services;

public class DockService : IDockService
{
    private readonly IDockRepository _dockRepository;

    public DockService(IDockRepository dockRepository)
    {
        _dockRepository = dockRepository;
    }

    public async Task CreateAsync(Dock dock)
    {
        if (dock == null)
            throw new ArgumentNullException(nameof(dock));

        // Check for duplicate name
        var existingDockByName = await _dockRepository.GetByNameAsync(dock.Name);
        if (existingDockByName != null)
            throw new ArgumentException($"A dock with the name '{dock.Name}' already exists.", nameof(dock.Name));

        // Check for duplicate location
        var existingDockByLocation = await _dockRepository.GetByLocationAsync(dock.Location);
        if (existingDockByLocation != null)
            throw new ArgumentException($"A dock at location '{dock.Location}' already exists.", nameof(dock.Location));

        var existingDock = await _dockRepository.GetByIdAsync(dock.Id);
        if (existingDock != null)
            throw new ArgumentException($"A dock with ID '{dock.Id}' already exists.", nameof(dock.Id));

        await _dockRepository.AddAsync(dock);
    }

    public async Task UpdateAsync(Dock dock)
    {
        if (dock == null)
            throw new ArgumentNullException(nameof(dock));

        var existingDock = await _dockRepository.GetByIdAsync(dock.Id);
        if (existingDock == null)
            throw new ArgumentException("Dock not found.", nameof(dock.Id));

        // Check for duplicate name (excluding current dock)
        var dockWithSameName = await _dockRepository.GetByNameAsync(dock.Name);
        if (dockWithSameName != null && dockWithSameName.Id != dock.Id)
            throw new ArgumentException($"Another dock with the name '{dock.Name}' already exists.", nameof(dock.Name));

        // Check for duplicate location (excluding current dock)
        var dockWithSameLocation = await _dockRepository.GetByLocationAsync(dock.Location);
        if (dockWithSameLocation != null && dockWithSameLocation.Id != dock.Id)
            throw new ArgumentException($"Another dock at location '{dock.Location}' already exists.", nameof(dock.Location));

        existingDock.Name = dock.Name;
        existingDock.Location = dock.Location;
        existingDock.UpdateLength(dock.LengthMeters);
        existingDock.UpdateDepth(dock.DepthMeters);
        existingDock.UpdateMaxDraft(dock.MaxDraftMeters);
        existingDock.UpdateAllowedVesselTypes(dock.AllowedVesselTypes);

        await _dockRepository.UpdateAsync(existingDock);
    }

    public async Task<Dock?> GetByIdAsync(Guid id) =>
        await _dockRepository.GetByIdAsync(id);

    public async Task<Dock?> GetByNameAsync(string name) =>
        await _dockRepository.GetByNameAsync(name);

    public async Task<Dock?> GetByLocationAsync(string location) =>
        await _dockRepository.GetByLocationAsync(location);

    public async Task<List<Dock>> SearchByVesselTypeAsync(string vesselTypeName) =>
        await _dockRepository.SearchByVesselTypeAsync(vesselTypeName);

    public async Task<List<Dock>> SearchByLocationAsync(string location) =>
        await _dockRepository.SearchByLocationAsync(location);

    public async Task<List<Dock>> SearchByNameAsync(string name) =>
        await _dockRepository.SearchByNameAsync(name);

    public async Task DeleteAsync(Guid id)
    {
        var dock = await _dockRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Dock not found.");

        await _dockRepository.DeleteAsync(dock);
    }

    public async Task<List<Dock>> GetAllAsync() =>
        await _dockRepository.GetAllAsync();
}