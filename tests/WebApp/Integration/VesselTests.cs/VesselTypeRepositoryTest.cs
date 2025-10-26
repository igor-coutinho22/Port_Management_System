using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories.VesselTypeRepository;
using FluentAssertions;
using Xunit;
using System;
using System.Threading.Tasks;

public class VesselTypeRepositoryTest
{
    private readonly PortManagementContext _context;
    private readonly VesselTypeRepository _repository;

    public VesselTypeRepositoryTest()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new PortManagementContext(options);
        _repository = new VesselTypeRepository(_context);
    }

    [Fact]
    public async Task AddVesselTypeAsync_ShouldPersistVesselType()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Container Ship", "Large container vessel", 20, 18, 8);

        // Act
        await _repository.AddVesselTypeAsync(vesselType);

        // Assert
        var result = await _repository.GetVesselTypeByNameAsync("Test Container Ship");
        result.Should().NotBeNull();
        result!.Description.Should().Be("Large container vessel");
        result.MaxBays.Should().Be(20);
        result.MaxRows.Should().Be(18);
        result.MaxTiers.Should().Be(8);
    }

    [Fact]
    public async Task AddVesselTypeAsync_ShouldThrow_WhenDuplicateNameExists()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Test Bulk Carrier", "Dry bulk vessel", 15, 12, 6);
        var vesselType2 = VesselType.CreateForUpdate("Test Bulk Carrier", "Another bulk vessel", 20, 14, 7);

        await _repository.AddVesselTypeAsync(vesselType1);

        // Act & Assert
        var act = async () => await _repository.AddVesselTypeAsync(vesselType2);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("A vessel type with the name 'Test Bulk Carrier' already exists.");
    }

    [Fact]
    public async Task GetVesselTypeByNameAsync_ShouldReturnNull_WhenNotFound()
    {
        // Act
        var result = await _repository.GetVesselTypeByNameAsync("Nonexistent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetVesselTypeByNameAsync_ShouldReturnVesselType_WhenExists()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Tanker", "Oil tanker", 12, 10, 4);
        await _repository.AddVesselTypeAsync(vesselType);

        // Act
        var result = await _repository.GetVesselTypeByNameAsync("Tanker");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Tanker");
        result.Description.Should().Be("Oil tanker");
    }

    [Fact]
    public async Task GetAllVesselTypesAsync_ShouldReturnAllVesselTypes()
    {
        // Arrange
        var initialCount = (await _repository.GetAllVesselTypesAsync()).Count;
        var vesselType1 = VesselType.CreateForUpdate("Test Ferry", "Passenger ferry", 8, 6, 2);
        var vesselType2 = VesselType.CreateForUpdate("Test Cargo Ship", "General cargo", 16, 14, 6);
        
        await _repository.AddVesselTypeAsync(vesselType1);
        await _repository.AddVesselTypeAsync(vesselType2);

        // Act
        var result = await _repository.GetAllVesselTypesAsync();

        // Assert
        result.Should().HaveCount(initialCount + 2);
        result.Should().Contain(vt => vt.Name == "Test Ferry");
        result.Should().Contain(vt => vt.Name == "Test Cargo Ship");
    }

    [Fact]
    public async Task SearchVesselTypeByNameAsync_ShouldReturnMatchingVesselTypes()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Test Container Ship", "Large container vessel", 20, 18, 8);
        var vesselType2 = VesselType.CreateForUpdate("Test Container Feeder", "Small container vessel", 12, 10, 6);
        var vesselType3 = VesselType.CreateForUpdate("Test Bulk Carrier", "Dry bulk vessel", 15, 12, 6);
        
        await _repository.AddVesselTypeAsync(vesselType1);
        await _repository.AddVesselTypeAsync(vesselType2);
        await _repository.AddVesselTypeAsync(vesselType3);

        // Act
        var result = await _repository.SearchVesselTypeByNameAsync("Test Container");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(vt => vt.Name == "Test Container Ship");
        result.Should().Contain(vt => vt.Name == "Test Container Feeder");
        result.Should().NotContain(vt => vt.Name == "Test Bulk Carrier");
    }

    [Fact]
    public async Task SearchVesselTypeByDescriptionAsync_ShouldReturnMatchingVesselTypes()
    {
        // Arrange
        var vesselType1 = VesselType.CreateForUpdate("Test Container Ship", "Large container vessel", 20, 18, 8);
        var vesselType2 = VesselType.CreateForUpdate("Test Container Feeder", "Small container vessel", 12, 10, 6);
        var vesselType3 = VesselType.CreateForUpdate("Test Tanker", "Oil carrier vessel", 10, 8, 4);
        
        await _repository.AddVesselTypeAsync(vesselType1);
        await _repository.AddVesselTypeAsync(vesselType2);
        await _repository.AddVesselTypeAsync(vesselType3);

        // Act
        var result = await _repository.SearchVesselTypeByDescriptionAsync("container");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(vt => vt.Description.Contains("container"));
        result.Should().NotContain(vt => vt.Name == "Test Tanker");
    }

    [Fact]
    public async Task UpdateVesselTypeAsync_ShouldUpdateVesselType()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("RoRo Ship", "Roll-on/Roll-off vessel", 6, 4, 2);
        await _repository.AddVesselTypeAsync(vesselType);

        // Act
        vesselType.Description = "Updated Roll-on/Roll-off vessel";
        vesselType.UpdateMaxBays(8);
        await _repository.UpdateVesselTypeAsync(vesselType);

        // Assert
        var updated = await _repository.GetVesselTypeByNameAsync("RoRo Ship");
        updated.Should().NotBeNull();
        updated!.Description.Should().Be("Updated Roll-on/Roll-off vessel");
        updated.MaxBays.Should().Be(8);
    }

    [Fact]
    public async Task DeleteVesselTypeAsync_ShouldRemoveVesselType()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Research Vessel", "Scientific research vessel", 4, 3, 2);
        await _repository.AddVesselTypeAsync(vesselType);

        // Act
        await _repository.DeleteVesselTypeAsync(vesselType);

        // Assert
        var result = await _repository.GetVesselTypeByNameAsync("Research Vessel");
        result.Should().BeNull();
    }

    [Fact]
    public async Task SearchVesselTypeByNameAsync_ShouldReturnEmpty_WhenNoMatches()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Yacht", "Luxury yacht", 2, 2, 1);
        await _repository.AddVesselTypeAsync(vesselType);

        // Act
        var result = await _repository.SearchVesselTypeByNameAsync("Submarine");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchVesselTypeByDescriptionAsync_ShouldReturnEmpty_WhenNoMatches()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Cruise Ship", "Passenger cruise vessel", 10, 8, 4);
        await _repository.AddVesselTypeAsync(vesselType);

        // Act
        var result = await _repository.SearchVesselTypeByDescriptionAsync("military");

        // Assert
        result.Should().BeEmpty();
    }
}