using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;

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
        {
            Id = 1,
            Name = "Yard 01",
            MaxCapacityTeu = 300,
            CurrentOccupancyTeu = 100
        };

        await repo.AddStorageAreaAsync(yard);

        var result = await context.StorageAreas.FirstOrDefaultAsync(s => s.Id == 1);

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
        {
            Id = 2,
            Name = "Warehouse 01",
            MaxCapacityTeu = 1000,
            CurrentOccupancyTeu = 400,
            SpecializedCargoType = "Perishable"
        };

        await repo.AddStorageAreaAsync(warehouse);

        var result = await context.StorageAreas.FirstOrDefaultAsync(s => s.Id == 2);

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
            new ContainerYard { Id = 3, Name = "Yard A", MaxCapacityTeu = 100 },
            new Warehouse { Id = 4, Name = "Warehouse A", MaxCapacityTeu = 200 }
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

        var warehouse = new Warehouse { Id = 5, Name = "Warehouse B", MaxCapacityTeu = 500 };
        await context.StorageAreas.AddAsync(warehouse);
        await context.SaveChangesAsync();

        var result = await repo.SearchByIdAsync(5);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Warehouse B");
    }

    [Fact]
    public async Task GetByNameAsync_ShouldReturnCorrectStorageArea()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard { Id = 6, Name = "FindMe", MaxCapacityTeu = 150 };
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

        var yard = new ContainerYard { Id = 7, Name = "Old Yard", MaxCapacityTeu = 200 };
        await context.StorageAreas.AddAsync(yard);
        await context.SaveChangesAsync();

        yard.Name = "Updated Yard";
        yard.ChangeMaxCapacity(400);
        await repo.UpdateContainerYardAsync(yard);

        var updated = await context.StorageAreas.FirstAsync(s => s.Id == 7);
        updated.Name.Should().Be("Updated Yard");
        updated.MaxCapacityTeu.Should().Be(400);
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ShouldPersistChanges()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var warehouse = new Warehouse { Id = 8, Name = "Old Warehouse", MaxCapacityTeu = 500, SpecializedCargoType = "General" };
        await context.StorageAreas.AddAsync(warehouse);
        await context.SaveChangesAsync();

        warehouse.Name = "Updated Warehouse";
        warehouse.UpdateCargoType("Hazardous");

        await repo.UpdateWarehouseAsync(warehouse);

        var updated = await context.StorageAreas.FirstAsync(s => s.Id == 8);
        updated.Name.Should().Be("Updated Warehouse");
        (updated as Warehouse)!.SpecializedCargoType.Should().Be("Hazardous");
    }

    [Fact]
    public async Task DeleteStorageAreaAsync_ShouldRemoveEntity()
    {
        using var context = new PortManagementContext(_options);
        var repo = new StorageAreaRepository(context);

        var yard = new ContainerYard { Id = 9, Name = "ToDelete", MaxCapacityTeu = 200 };
        await context.StorageAreas.AddAsync(yard);
        await context.SaveChangesAsync();

        await repo.DeleteStorageAreaAsync(yard);

        var exists = await context.StorageAreas.AnyAsync(s => s.Id == 9);
        exists.Should().BeFalse();
    }
}
