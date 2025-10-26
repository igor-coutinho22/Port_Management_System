using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Application.Services;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

public class StorageAreaServiceTests
{
    private readonly StubStorageAreaRepository _repo;
    private readonly StorageAreaService _service;

    public StorageAreaServiceTests()
    {
        _repo = new StubStorageAreaRepository();
        _service = new StorageAreaService(_repo);
    }

    [Fact]
    public async Task AddContainerYardAsync_ShouldAdd_WhenValid()
    {
        var yard = new ContainerYard
        {
            Id = 1,
            Name = "Yard A",
            MaxCapacityTeu = 200,
            CurrentOccupancyTeu = 50
        };

        await _service.AddContainerYardAsync(yard);

        var result = await _repo.SearchByIdAsync(1);
        result.Should().NotBeNull();
        result!.Name.Should().Be("Yard A");
    }

    [Fact]
    public async Task AddContainerYardAsync_ShouldThrow_WhenDuplicateId()
    {
        var yard = new ContainerYard { Id = 2, Name = "Duplicate Yard", MaxCapacityTeu = 100 };
        await _repo.AddStorageAreaAsync(yard);

        var duplicate = new ContainerYard { Id = 2, Name = "Yard Copy", MaxCapacityTeu = 150 };
        var act = async () => await _service.AddContainerYardAsync(duplicate);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task AddWarehouseAsync_ShouldAdd_WhenValid()
    {
        var warehouse = new Warehouse
        {
            Id = 3,
            Name = "Warehouse Alpha",
            MaxCapacityTeu = 300,
            CurrentOccupancyTeu = 120,
            SpecializedCargoType = "Hazardous"
        };

        await _service.AddWarehouseAsync(warehouse);

        var result = await _repo.SearchByIdAsync(3);
        result.Should().NotBeNull();
        result!.Name.Should().Be("Warehouse Alpha");
    }

    [Fact]
    public async Task AddWarehouseAsync_ShouldThrow_WhenDuplicateId()
    {
        var warehouse = new Warehouse { Id = 4, Name = "Warehouse Beta", MaxCapacityTeu = 400 };
        await _repo.AddStorageAreaAsync(warehouse);

        var duplicate = new Warehouse { Id = 4, Name = "Warehouse Copy", MaxCapacityTeu = 500 };
        var act = async () => await _service.AddWarehouseAsync(duplicate);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task UpdateContainerYardAsync_ShouldUpdate_WhenExists()
    {
        var yard = new ContainerYard { Id = 5, Name = "Old Yard", MaxCapacityTeu = 100, CurrentOccupancyTeu = 20 };
        await _repo.AddStorageAreaAsync(yard);

        yard.Name = "Updated Yard";
        yard.MaxCapacityTeu = 150;
        yard.CurrentOccupancyTeu = 30;

        await _service.UpdateContainerYardAsync(yard);

        var updated = await _repo.SearchByIdAsync(5);
        updated!.Name.Should().Be("Updated Yard");
        updated.MaxCapacityTeu.Should().Be(150);
    }

    [Fact]
    public async Task UpdateContainerYardAsync_ShouldThrow_WhenNotFound()
    {
        var yard = new ContainerYard { Id = 6, Name = "Missing Yard", MaxCapacityTeu = 100 };
        var act = async () => await _service.UpdateContainerYardAsync(yard);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldUpdate_WhenExists()
    {
        var warehouse = new Warehouse { Id = 7, Name = "Old Warehouse", MaxCapacityTeu = 200, SpecializedCargoType = "General" };
        await _repo.AddStorageAreaAsync(warehouse);

        warehouse.Name = "Updated Warehouse";
        warehouse.MaxCapacityTeu = 250;
        warehouse.SpecializedCargoType = "Perishable";

        await _service.UpdateWarehouseAsync(warehouse);

        var updated = await _repo.SearchByIdAsync(7);
        updated!.Name.Should().Be("Updated Warehouse");
        (updated as Warehouse)!.SpecializedCargoType.Should().Be("Perishable");
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldThrow_WhenNotFound()
    {
        var warehouse = new Warehouse { Id = 8, Name = "Nonexistent Warehouse", MaxCapacityTeu = 300 };
        var act = async () => await _service.UpdateWarehouseAsync(warehouse);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task GetAllStorageAreasAsync_ShouldReturnAll()
    {
        await _repo.AddStorageAreaAsync(new ContainerYard { Id = 9, Name = "Yard 1" });
        await _repo.AddStorageAreaAsync(new Warehouse { Id = 10, Name = "Warehouse 1" });

        var result = await _service.GetAllStorageAreasAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task DeleteStorageAreaAsync_ShouldRemove_WhenExists()
    {
        var area = new Warehouse { Id = 11, Name = "Deletable" };
        await _repo.AddStorageAreaAsync(area);

        await _service.DeleteStorageAreaAsync(11);

        var result = await _repo.SearchByIdAsync(11);
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

        public Task AddStorageAreaAsync(StorageArea area)
        {
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
