using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;
using WebApp.Models.Application.Services.Resources;
using WebApp.Models.Domain.Qualifications;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            .WithMessage("A resource with status Inactive cannot be set to maintenance");
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
            .WithMessage("A resource with status Inactive cannot end maintenance");
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
            .WithMessage("A resource with status Active cannot be activated");
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
        private readonly Dictionary<string, Resource> _resources = new();

        public Task<Resource?> GetByIdAsync(string id)
        {
            _resources.TryGetValue(id, out var resource);
            return Task.FromResult(resource);
        }

        public Task<Resource?> GetByDescriptionAsync(string description)
        {
            var resource = _resources.Values.FirstOrDefault(r =>
                r.Description != null && r.Description.Equals(description, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(resource);
        }

        public Task<List<Resource>> GetAllAsync() =>
            Task.FromResult(_resources.Values.ToList());

        public Task AddResourceAsync(Resource resource)
        {
            if (string.IsNullOrWhiteSpace(resource.Id))
                throw new ArgumentException("Resource ID cannot be null or empty.");

            _resources[resource.Id!] = resource;
            return Task.CompletedTask;
        }

        public Task<List<Resource>> GetByTypeAsync(ResourceType type)
        {
            var result = _resources.Values.Where(r => r.ResourceType == type).ToList();
            return Task.FromResult(result);
        }

        public Task<List<Resource>> GetByStatusAsync(ResourceAvailabilityStatus status)
        {
            var result = _resources.Values.Where(r => r.Status == status).ToList();
            return Task.FromResult(result);
        }

        public Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus)
        {
            if (_resources.TryGetValue(id, out var resource))
                resource.Status = newStatus;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(string id)
        {
            _resources.Remove(id);
            return Task.CompletedTask;
        }
    }
}