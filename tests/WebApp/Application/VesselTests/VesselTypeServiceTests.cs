using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Application.Services.VesselTypeService;
using Xunit;

public class VesselTypeServiceTests
{
    private readonly StubVesselTypeRepository _repo;
    private readonly VesselTypeService _service;

    public VesselTypeServiceTests()
    {
        _repo = new StubVesselTypeRepository();
        _service = new VesselTypeService(_repo);
    }

    [Fact]
    public async Task AddVesselTypeAsync_ShouldAdd_WhenValid()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);

        // Act
        await _service.AddVesselTypeAsync(vesselType);

        // Assert
        var result = await _repo.GetVesselTypeByNameAsync("Container Ship");
        result.Should().NotBeNull();
        result!.Description.Should().Be("Large container vessel");
        result.MaxBays.Should().Be(20);
    }

    [Fact]
    public async Task AddVesselTypeAsync_ShouldThrow_WhenDuplicateName()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Bulk Carrier", "Dry bulk vessel", 15, 12, 6);
        var vesselType2 = VesselType.CreateForUpdate("Bulk Carrier", "Another bulk vessel", 20, 14, 7);
        
        await _repo.AddVesselTypeAsync(vesselType1);

        // Act & Assert
        var act = async () => await _service.AddVesselTypeAsync(vesselType2);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task AddVesselTypeAsync_ShouldThrow_WhenNull()
    {
        // Act & Assert
        var act = async () => await _service.AddVesselTypeAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task GetVesselTypeByNameAsync_ShouldReturn_WhenExists()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Tanker", "Oil tanker", 12, 10, 4);
        await _repo.AddVesselTypeAsync(vesselType);

        // Act
        var result = await _service.GetVesselTypeByNameAsync("Tanker");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Tanker");
        result.Description.Should().Be("Oil tanker");
    }

    [Fact]
    public async Task GetVesselTypeByNameAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _service.GetVesselTypeByNameAsync("Nonexistent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllVesselTypesAsync_ShouldReturnAll()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Ferry", "Passenger ferry", 8, 6, 2);
        var vesselType2 = VesselType.CreateForUpdate("Cargo Ship", "General cargo", 16, 14, 6);
        
        await _repo.AddVesselTypeAsync(vesselType1);
        await _repo.AddVesselTypeAsync(vesselType2);

        // Act
        var result = await _service.GetAllVesselTypesAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(vt => vt.Name == "Ferry");
        result.Should().Contain(vt => vt.Name == "Cargo Ship");
    }

    [Fact]
    public async Task SearchVesselTypesByNameAsync_ShouldReturnMatches()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
        var vesselType2 = VesselType.CreateForUpdate("Container Feeder", "Small container vessel", 12, 10, 6);
        var vesselType3 = VesselType.CreateForUpdate("Bulk Carrier", "Dry bulk vessel", 15, 12, 6);
        
        await _repo.AddVesselTypeAsync(vesselType1);
        await _repo.AddVesselTypeAsync(vesselType2);
        await _repo.AddVesselTypeAsync(vesselType3);

        // Act
        var result = await _service.SearchVesselTypesByNameAsync("Container");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(vt => vt.Name == "Container Ship");
        result.Should().Contain(vt => vt.Name == "Container Feeder");
    }

    [Fact]
    public async Task SearchVesselTypesByDescriptionAsync_ShouldReturnMatches()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
        var vesselType2 = VesselType.CreateForUpdate("Container Feeder", "Small container vessel", 12, 10, 6);
        var vesselType3 = VesselType.CreateForUpdate("Tanker", "Oil carrier vessel", 10, 8, 4);
        
        await _repo.AddVesselTypeAsync(vesselType1);
        await _repo.AddVesselTypeAsync(vesselType2);
        await _repo.AddVesselTypeAsync(vesselType3);

        // Act
        var result = await _service.SearchVesselTypesByDescriptionAsync("container");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(vt => vt.Description.Contains("container"));
    }

    [Fact]
    public async Task UpdateVesselTypeAsync_ShouldUpdate_WhenExists()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("RoRo Ship", "Roll-on/Roll-off vessel", 6, 4, 2);
        await _repo.AddVesselTypeAsync(vesselType);

        // Act
        vesselType.Description = "Updated Roll-on/Roll-off vessel";
        vesselType.UpdateMaxBays(8);
        await _service.UpdateVesselTypeAsync(vesselType);

        // Assert
        var updated = await _repo.GetVesselTypeByNameAsync("RoRo Ship");
        updated.Should().NotBeNull();
        updated!.Description.Should().Be("Updated Roll-on/Roll-off vessel");
        updated.MaxBays.Should().Be(8);
    }

    [Fact]
    public async Task UpdateVesselTypeAsync_ShouldThrow_WhenNull()
    {
        // Act & Assert
        var act = async () => await _service.UpdateVesselTypeAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task UpdateVesselTypeAsync_ShouldThrow_WhenNotFound()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Nonexistent", "Does not exist", 10, 8, 4);

        // Act & Assert
        var act = async () => await _service.UpdateVesselTypeAsync(vesselType);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task DeleteVesselTypeAsync_ShouldRemove_WhenExists()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Research Vessel", "Scientific research vessel", 4, 3, 2);
        await _repo.AddVesselTypeAsync(vesselType);

        // Act
        await _service.DeleteVesselTypeAsync("Research Vessel");

        // Assert
        var result = await _repo.GetVesselTypeByNameAsync("Research Vessel");
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteVesselTypeAsync_ShouldThrow_WhenNotFound()
    {
        // Act & Assert
        var act = async () => await _service.DeleteVesselTypeAsync("Nonexistent");
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    // Nested Stub Repository
    private class StubVesselTypeRepository : IVesselTypeRepository
    {
        private readonly List<VesselType> _vesselTypes = new();

        public Task<List<VesselType>> GetAllVesselTypesAsync()
            => Task.FromResult(_vesselTypes.ToList());

        public Task<VesselType> GetVesselTypeByNameAsync(string name)
            => Task.FromResult(_vesselTypes.FirstOrDefault(vt => vt.Name == name));

        public Task<List<VesselType>> SearchVesselTypeByNameAsync(string partialName)
            => Task.FromResult(_vesselTypes.Where(vt => vt.Name.Contains(partialName)).ToList());

        public Task<List<VesselType>> SearchVesselTypeByDescriptionAsync(string keyword)
            => Task.FromResult(_vesselTypes.Where(vt => vt.Description.Contains(keyword)).ToList());

        public Task AddVesselTypeAsync(VesselType vesselType)
        {
            var exists = _vesselTypes.Any(vt => vt.Name == vesselType.Name);
            if (exists)
                throw new InvalidOperationException($"A vessel type with the name '{vesselType.Name}' already exists.");

            _vesselTypes.Add(vesselType);
            return Task.CompletedTask;
        }

        public Task UpdateVesselTypeAsync(VesselType updatedVesselType)
        {
            var existing = _vesselTypes.FirstOrDefault(vt => vt.Name == updatedVesselType.Name);
            if (existing != null)
            {
                existing.Description = updatedVesselType.Description;
                existing.UpdateMaxBays(updatedVesselType.MaxBays);
                existing.UpdateMaxRows(updatedVesselType.MaxRows);
                existing.UpdateMaxTiers(updatedVesselType.MaxTiers);
            }
            return Task.CompletedTask;
        }

        public Task DeleteVesselTypeAsync(VesselType vesselType)
        {
            _vesselTypes.RemoveAll(vt => vt.Name == vesselType.Name);
            return Task.CompletedTask;
        }
    }
}