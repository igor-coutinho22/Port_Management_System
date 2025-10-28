using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using WebApp.Models.Domain.Docks;

public class StorageAreaRepositoryTests
{
    private readonly DbContextOptions<PortManagementContext> _options;

    public StorageAreaRepositoryTests()
    {
        _options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: $"PortManagement_{System.Guid.NewGuid()}")
            .Options;
    }

    [Fact]
    public async Task AddStorageAreaAsync_ShouldPersistContainerYard()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard
        (
            name: "Yard 01",
            maxCapacityTeu: 300,
            currentOccupancyTeu: 100,
            docksServed: new List<Dock>()
        );

        await repo.AddStorageAreaAsync(yard);

        var result = await context.StorageAreas.FirstOrDefaultAsync(s => s.Name == "Yard 01");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Yard 01");
        result.Should().BeOfType<ContainerYard>();
    }

    [Fact]
    public async Task AddStorageAreaAsync_ShouldPersistWarehouse()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var warehouse = new Warehouse
        (
            name: "Warehouse 01",
            maxCapacityTeu: 1000,
            currentOccupancyTeu: 400,
            specializedCargoType: "Perishable"
        );

        await repo.AddStorageAreaAsync(warehouse);

        var result = await context.StorageAreas.FirstOrDefaultAsync(s => s.Name == "Warehouse 01");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Warehouse 01");
        result.Should().BeOfType<Warehouse>();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllStorageAreas()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var areas = new List<StorageArea>
        {
            new ContainerYard (name: "Yard A", maxCapacityTeu: 100, currentOccupancyTeu: 50, docksServed: new List<Dock>()),
            new Warehouse (name: "Warehouse A", maxCapacityTeu: 200, currentOccupancyTeu: 100, specializedCargoType: "General")
        };

        await context.StorageAreas.AddRangeAsync(areas);
        await context.SaveChangesAsync();

        var result = await repo.GetAllAsync();

        result.Should().HaveCount(2);
        result.Should().Contain(a => a.Name == "Yard A");
        result.Should().Contain(a => a.Name == "Warehouse A");
    }

    [Fact]
    public async Task SearchByIdAsync_ShouldReturnCorrectStorageArea()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var warehouse = new Warehouse (name: "Warehouse B", maxCapacityTeu: 500, currentOccupancyTeu: 200, specializedCargoType: "General");
        await context.StorageAreas.AddAsync(warehouse);
        await context.SaveChangesAsync();

        var result = await repo.SearchByIdAsync(warehouse.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Warehouse B");
    }

    [Fact]
    public async Task GetByNameAsync_ShouldReturnCorrectStorageArea()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard (name: "FindMe", maxCapacityTeu: 150, currentOccupancyTeu: 75, docksServed: new List<Dock>());
        await context.StorageAreas.AddAsync(yard);
        await context.SaveChangesAsync();

        var result = await repo.GetByNameAsync("FindMe");

        result.Should().NotBeNull();
        result!.Name.Should().Be("FindMe");
    }

    [Fact]
    public async Task UpdateContainerYardAsync_ShouldPersistChanges()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard (name: "Old Yard", maxCapacityTeu: 200, currentOccupancyTeu: 100, docksServed: new List<Dock>());
        await context.StorageAreas.AddAsync(yard);
        await context.SaveChangesAsync();

        yard.Name = "Updated Yard";
        yard.ChangeMaxCapacity(400);
        await repo.UpdateContainerYardAsync(yard);

        var updated = await context.StorageAreas.FirstAsync(s => s.Id == yard.Id);
        updated.Name.Should().Be("Updated Yard");
        updated.MaxCapacityTeu.Should().Be(400);
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldPersistChanges()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var warehouse = new Warehouse (name: "Old Warehouse", maxCapacityTeu: 500, currentOccupancyTeu: 200, specializedCargoType: "General");
        await context.StorageAreas.AddAsync(warehouse);
        await context.SaveChangesAsync();

        warehouse.Name = "Updated Warehouse";
        warehouse.UpdateCargoType("Hazardous");

        await repo.UpdateWarehouseAsync(warehouse);

        var updated = await context.StorageAreas.FirstAsync(s => s.Id == warehouse.Id);
        updated.Name.Should().Be("Updated Warehouse");
        (updated as Warehouse)!.SpecializedCargoType.Should().Be("Hazardous");
    }

    [Fact]
    public async Task DeleteStorageAreaAsync_ShouldRemoveEntity()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard (name: "ToDelete", maxCapacityTeu: 200, currentOccupancyTeu: 100, docksServed: new List<Dock>());
        await context.StorageAreas.AddAsync(yard);
        await context.SaveChangesAsync();

        await repo.DeleteStorageAreaAsync(yard);

        var exists = await context.StorageAreas.AnyAsync(s => s.Id == yard.Id);
        exists.Should().BeFalse();
    }
}
