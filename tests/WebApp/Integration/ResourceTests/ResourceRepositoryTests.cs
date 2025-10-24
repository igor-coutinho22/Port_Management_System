using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Infrastructure.Repositories.Resources;
using FluentAssertions;

public class ResourceRepositoryTests
{
    private readonly PortManagementContext _context;
    private readonly ResourceRepository _repo;

    public ResourceRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: "ResourceRepoTestDB")
            .Options;
        _context = new PortManagementContext(options);
        _repo = new ResourceRepository(_context);
    }

    [Fact]
    public async Task AddResource_ShouldPersistResource()
    {
        var resource = new Resource("R001", "Crane", ResourceType.STSCrane, 100, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        var retrieved = await _repo.GetByIdAsync("R001");
        retrieved.Should().NotBeNull();
        retrieved!.Description.Should().Be("Crane");
    }

    [Fact]
    public async Task UpdateAvailability_ShouldOnlyChangeStatus()
    {
        var resource = new Resource("R002", "Truck", ResourceType.Truck, 30, ResourceAvailabilityStatus.Active, 5, new());
        await _repo.AddResourceAsync(resource);

        await _repo.UpdateAvailabilityAsync("R002", ResourceAvailabilityStatus.UnderMaintenance);
        var updated = await _repo.GetByIdAsync("R002");

        updated!.Status.Should().Be(ResourceAvailabilityStatus.UnderMaintenance);
        updated.Description.Should().Be("Truck");
    }
}
