using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Application.Services;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Xunit;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain.Docks;

public class StorageAreaServiceTests
{
    private readonly IStorageAreaRepository _repo = new StubStorageAreaRepository();
    private readonly StorageAreaService _service;

    public StorageAreaServiceTests()
    {
        _service = new StorageAreaService(_repo);
    }

    [Fact]
    public async Task AddContainerYardAsync_ShouldAdd_WhenValid()
    {
        var yard = new ContainerYard
        (
            name: "Yard A",
            maxCapacityTeu: 200,
            currentOccupancyTeu: 50,
            docksServed: new List<Dock>()
        );

        await _service.AddContainerYardAsync(yard);

        var result = await _repo.SearchByIdAsync(yard.Id);
        result.Should().NotBeNull();
        result!.Name.Should().Be("Yard A");
    }

    [Fact]
    public async Task AddWarehouseAsync_ShouldAdd_WhenValid()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse Alpha",
            maxCapacityTeu: 300,
            currentOccupancyTeu: 120,
            specializedCargoType: "Hazardous"
        );

        await _service.AddWarehouseAsync(warehouse);

        var result = await _repo.SearchByIdAsync(warehouse.Id);
        result.Should().NotBeNull();
        result!.Name.Should().Be("Warehouse Alpha");
    }

    [Fact]
    public async Task UpdateContainerYardAsync_ShouldUpdate_WhenExists()
    {
        var yard = new ContainerYard (name: "Old Yard", maxCapacityTeu: 100, currentOccupancyTeu: 20, docksServed: new List<Dock>());
        await _repo.AddStorageAreaAsync(yard);

        yard.Name = "Updated Yard";
        yard.ChangeMaxCapacity(150);
        yard.UpdateCurrentOccupancy(30);

        await _service.UpdateContainerYardAsync(yard);

        var updated = await _repo.SearchByIdAsync(yard.Id);
        updated!.Name.Should().Be("Updated Yard");
        updated.MaxCapacityTeu.Should().Be(150);
    }

    [Fact]
    public async Task UpdateContainerYardAsync_ShouldThrow_WhenNotFound()
    {
        var yard = new ContainerYard (name: "Missing Yard", maxCapacityTeu: 100, currentOccupancyTeu: 0, docksServed: new List<Dock>());
        var act = async () => await _service.UpdateContainerYardAsync(yard);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldUpdate_WhenExists()
    {
        var warehouse = new Warehouse (name: "Old Warehouse", maxCapacityTeu: 200, currentOccupancyTeu: 100, specializedCargoType: "General");
        await _repo.AddStorageAreaAsync(warehouse);

        warehouse.Name = "Updated Warehouse";
        warehouse.ChangeMaxCapacity(250);
        warehouse.UpdateCargoType("Perishable");

        await _service.UpdateWarehouseAsync(warehouse);

        var updated = await _repo.SearchByIdAsync(warehouse.Id);
        updated!.Name.Should().Be("Updated Warehouse");
        (updated as Warehouse)!.SpecializedCargoType.Should().Be("Perishable");
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldThrow_WhenNotFound()
    {
        var warehouse = new Warehouse (name: "Nonexistent Warehouse", maxCapacityTeu: 300, currentOccupancyTeu: 0, specializedCargoType: "General");
        var act = async () => await _service.UpdateWarehouseAsync(warehouse);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task GetAllStorageAreasAsync_ShouldReturnAll()
    {
        await _repo.AddStorageAreaAsync(new ContainerYard (name: "Yard 1", maxCapacityTeu: 100, currentOccupancyTeu: 50, docksServed: new List<Dock>()));
        await _repo.AddStorageAreaAsync(new Warehouse (name: "Warehouse 1", maxCapacityTeu: 200, currentOccupancyTeu: 100, specializedCargoType: "General"));

        var result = await _service.GetAllStorageAreasAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task DeleteStorageAreaAsync_ShouldRemove_WhenExists()
    {
        var area = new Warehouse (name: "Deletable", maxCapacityTeu: 300, currentOccupancyTeu: 100, specializedCargoType: "General");
        await _repo.AddStorageAreaAsync(area);

        await _service.DeleteStorageAreaAsync(area.Id);

        var result = await _repo.SearchByIdAsync(area.Id);
        result.Should().BeNull();
    }

    //
    //
    // === STUB REPOSITORY ===
    //
    //
    private class StubStorageAreaRepository : IStorageAreaRepository
    {
        private readonly Dictionary<int, StorageArea> _storageAreas = new();
        private int _nextId = 1;

        public Task AddStorageAreaAsync(StorageArea area)
        {
            // Simulate Entity Framework ID generation for entities with Id = 0
            if (area.Id == 0)
            {
                // Use reflection to set the protected Id property
                var idProperty = typeof(StorageArea).GetProperty("Id");
                idProperty?.SetValue(area, _nextId++);
            }
            _storageAreas[area.Id] = area;
            return Task.CompletedTask;
        }

        public Task UpdateContainerYardAsync(ContainerYard yard)
        {
            _storageAreas[yard.Id] = yard;
            return Task.CompletedTask;
        }

        public Task UpdateWarehouseAsync(Warehouse warehouse)
        {
            _storageAreas[warehouse.Id] = warehouse;
            return Task.CompletedTask;
        }

        public Task<List<StorageArea>> GetAllAsync() =>
            Task.FromResult(_storageAreas.Values.ToList());

        public Task<StorageArea?> SearchByIdAsync(int id)
        {
            _storageAreas.TryGetValue(id, out var area);
            return Task.FromResult(area);
        }

        public Task<StorageArea?> GetByNameAsync(string name)
        {
            var result = _storageAreas.Values.FirstOrDefault(a => a.Name == name);
            return Task.FromResult(result);
        }

        public Task DeleteStorageAreaAsync(StorageArea area)
        {
            _storageAreas.Remove(area.Id);
            return Task.CompletedTask;
        }

        // Unused connection methods for now
        public Task AddConnectionAsync(DockStorageAreaConnection c) => Task.CompletedTask;
        public Task UpdateConnectionAsync(DockStorageAreaConnection c) => Task.CompletedTask;
        public Task RemoveConnectionAsync(DockStorageAreaConnection c) => Task.CompletedTask;
        public Task<DockStorageAreaConnection?> GetConnectionAsync(int s, Guid d) => Task.FromResult<DockStorageAreaConnection?>(null);
        public Task<List<DockStorageAreaConnection>> GetConnectionsForStorageAreaAsync(int s) => Task.FromResult(new List<DockStorageAreaConnection>());
    }
}
