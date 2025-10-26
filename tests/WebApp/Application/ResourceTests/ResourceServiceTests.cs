using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Application.Services.Resources;
using WebApp.Models.Domain.Resources.Interfaces;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

public class ResourceServiceTests
{
    private readonly StubResourceRepository _repo;
    private readonly ResourceService _service;

    public ResourceServiceTests()
    {
        _repo = new StubResourceRepository();
        _service = new ResourceService(_repo);
    }

    [Fact]
    public async Task RegisterResourceAsync_ShouldAddResource_WhenValid()
    {
        var resource = new Resource("R100", "Crane A", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());

        await _service.RegisterResourceAsync(resource);

        var stored = await _repo.GetByIdAsync("R100");
        stored.Should().NotBeNull();
        stored!.Description.Should().Be("Crane A");
    }

    [Fact]
    public async Task RegisterResourceAsync_ShouldThrow_WhenIdAlreadyExists()
    {
        var resource = new Resource("R001", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        var duplicate = new Resource("R001", "Truck", ResourceType.Truck, 70, ResourceAvailabilityStatus.Active, 8, new());

        var act = async () => await _service.RegisterResourceAsync(duplicate);
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task RegisterResourceAsync_ShouldThrow_WhenIdIsNull()
    {
        var resource = new Resource(null!, "Invalid", ResourceType.Truck, 10, ResourceAvailabilityStatus.Active, 2, new());
        var act = async () => await _service.RegisterResourceAsync(resource);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task DeactivateAsync_ShouldUpdateStatus()
    {
        var resource = new Resource("R002", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        await _service.DeactivateAsync("R002");

        var updated = await _repo.GetByIdAsync("R002");
        updated!.Status.Should().Be(ResourceAvailabilityStatus.Inactive);
    }

    [Fact]
    public async Task DeactivateAsync_ShouldThrow_WhenResourceNotFound()
    {
        var act = async () => await _service.DeactivateAsync("XYZ");
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task PutInMaintenanceAsync_ShouldOnlyWork_WhenActive()
    {
        var resource = new Resource("R003", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        await _service.PutInMaintenanceAsync("R003");

        var updated = await _repo.GetByIdAsync("R003");
        updated!.Status.Should().Be(ResourceAvailabilityStatus.UnderMaintenance);
    }

    [Fact]
    public async Task PutInMaintenanceAsync_ShouldThrow_WhenInactive()
    {
        var resource = new Resource("R004", "Truck", ResourceType.Truck, 20, ResourceAvailabilityStatus.Inactive, 5, new());
        await _repo.AddResourceAsync(resource);

        var act = async () => await _service.PutInMaintenanceAsync("R004");
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("A resource with status 'inactive' cannot be set for maintenance.");
    }

    [Fact]
    public async Task EndMaintenanceAsync_ShouldOnlyWork_WhenUnderMaintenance()
    {
        var resource = new Resource("R005", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.UnderMaintenance, 10, new());
        await _repo.AddResourceAsync(resource);

        await _service.EndMaintenanceAsync("R005");

        var updated = await _repo.GetByIdAsync("R005");
        updated!.Status.Should().Be(ResourceAvailabilityStatus.Active);
    }

    [Fact]
    public async Task EndMaintenanceAsync_ShouldThrow_WhenNotInMaintenance()
    {
        var resource = new Resource("R006", "Truck", ResourceType.Truck, 20, ResourceAvailabilityStatus.Inactive, 5, new());
        await _repo.AddResourceAsync(resource);

        var act = async () => await _service.EndMaintenanceAsync("R006");
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("A resource with status 'inactive' cannot end maintenance.");
    }

    [Fact]
    public async Task ActivateAsync_ShouldOnlyWork_WhenInactive()
    {
        var resource = new Resource("R007", "Truck", ResourceType.Truck, 20, ResourceAvailabilityStatus.Inactive, 5, new());
        await _repo.AddResourceAsync(resource);

        await _service.ActivateAsync("R007");

        var updated = await _repo.GetByIdAsync("R007");
        updated!.Status.Should().Be(ResourceAvailabilityStatus.Active);
    }

    [Fact]
    public async Task ActivateAsync_ShouldThrow_WhenAlreadyActive()
    {
        var resource = new Resource("R008", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        var act = async () => await _service.ActivateAsync("R008");
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("A resource with status 'active' cannot be activated.");
    }

    [Fact]
    public async Task GetResourcesByStatus_ShouldReturnFilteredList()
    {
        await _repo.AddResourceAsync(new Resource("R009", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new()));
        await _repo.AddResourceAsync(new Resource("R010", "Truck", ResourceType.Truck, 30, ResourceAvailabilityStatus.Inactive, 5, new()));

        var activeResources = await _service.GetResourcesByStatusAsync(ResourceAvailabilityStatus.Active);

        activeResources.Should().HaveCount(1);
        activeResources.First().Id.Should().Be("R009");
    }

    [Fact]
    public async Task GetResourcesByType_ShouldReturnCorrectResources()
    {
        await _repo.AddResourceAsync(new Resource("R011", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new()));
        await _repo.AddResourceAsync(new Resource("R012", "Truck", ResourceType.Truck, 30, ResourceAvailabilityStatus.Active, 5, new()));

        var cranes = await _service.GetResourcesByTypeAsync(ResourceType.STSCrane);
        cranes.Should().HaveCount(1);
        cranes.First().Description.Should().Be("Crane");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveResource()
    {
        var resource = new Resource("R013", "Crane", ResourceType.STSCrane, 50, ResourceAvailabilityStatus.Active, 10, new());
        await _repo.AddResourceAsync(resource);

        await _service.DeleteAsync("R013");

        var result = await _repo.GetByIdAsync("R013");
        result.Should().BeNull();
    }

    //
    //
    //
    // NESTED STUB REPOSITORY
    //
    //
    //
    private class StubResourceRepository : IResourceRepository
    {
        private readonly List<Resource> _resources = new();

        public void AddResource(Resource resource)
        {
            _resources.Add(resource);
        }

        public Task AddResourceAsync(Resource resource)
        {
            _resources.Add(resource);
            return Task.CompletedTask;
        }

        public Resource? GetById(string id)
            => _resources.FirstOrDefault(r => r.Id == id);

        public Task<Resource?> GetByIdAsync(string id)
            => Task.FromResult(_resources.FirstOrDefault(r => r.Id == id));

        public Resource? GetByDescription(string description)
            => _resources.FirstOrDefault(r => r.Description == description);

        public Task<Resource?> GetByDescriptionAsync(string description)
            => Task.FromResult(_resources.FirstOrDefault(r => r.Description == description));

        public List<Resource> GetAll()
            => _resources.ToList();

        public Task<List<Resource>> GetAllAsync()
            => Task.FromResult(_resources.ToList());

        public List<Resource> GetByType(ResourceType type)
            => _resources.Where(r => r.ResourceType == type).ToList();

        public Task<List<Resource>> GetByTypeAsync(ResourceType type)
            => Task.FromResult(_resources.Where(r => r.ResourceType == type).ToList());

        public List<Resource> GetByStatus(ResourceAvailabilityStatus status)
            => _resources.Where(r => r.Status == status).ToList();

        public Task<List<Resource>> GetByStatusAsync(ResourceAvailabilityStatus status)
            => Task.FromResult(_resources.Where(r => r.Status == status).ToList());

        public void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus)
        {
            var res = _resources.FirstOrDefault(r => r.Id == id);
            if (res != null) res.Status = newStatus;
        }

        public Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus)
        {
            UpdateAvailability(id, newStatus);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Resource resource)
        {
            var existing = _resources.FirstOrDefault(r => r.Id == resource.Id);
            if (existing != null)
            {
                existing.Description = resource.Description;
                existing.ResourceType = resource.ResourceType;
                existing.Status = resource.Status;
                existing.OperationalCapacity = resource.OperationalCapacity;
            }
            return Task.CompletedTask;
        }

        public Task UpdateResourceAsync(Resource resource) => UpdateAsync(resource);

        public Task DeleteAsync(string id)
        {
            _resources.RemoveAll(r => r.Id == id);
            return Task.CompletedTask;
        }
    }

}