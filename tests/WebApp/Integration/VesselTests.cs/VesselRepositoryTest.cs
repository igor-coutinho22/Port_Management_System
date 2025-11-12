using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Infrastructure.Repositories.VesselRepository;
using FluentAssertions;
using Xunit;
using System;
using System.Threading.Tasks;
using System.Linq;
using WebApp.Models.Domain.Vessels;

public class VesselRepositoryTest
{
    private readonly PortManagementContext _context;
    private readonly VesselRepository _repository;

    public VesselRepositoryTest()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new PortManagementContext(options);
        _repository = new VesselRepository(_context);
    }

    private VesselType CreateTestVesselType()
    {
        return VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
    }

    [Fact]
    public async Task AddVesselAsync_ShouldPersistVessel()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("5363433", "MSC Vessel", "MSC Shipping", vesselType, 15, 12, 6, 4, 300.5);

        // Act
        await _repository.AddVesselAsync(vessel);

        // Assert
        var result = await _repository.GetByIMOAsync("5363433");
        result.Should().NotBeNull();
        result!.VesselName.Should().Be("MSC Vessel");
        result.OperatorName.Should().Be("MSC Shipping");
        result.Bays.Should().Be(15);
        result.Rows.Should().Be(12);
        result.Tiers.Should().Be(6);
    }

    [Fact]
    public async Task AddVesselAsync_ShouldThrow_WhenDuplicateIMOExists()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("2575774", "First Vessel", "First Operator", vesselType, 10, 10, 5, 2, 200.0);
        var vessel2 = new Vessel("2575774", "Second Vessel", "Second Operator", vesselType, 12, 8, 4, 3, 250.0);

        await _repository.AddVesselAsync(vessel1);

        // Act & Assert
        var act = async () => await _repository.AddVesselAsync(vessel2);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("A vessel with this IMO number already exists.");
    }

    [Fact]
    public async Task GetByIMOAsync_ShouldReturnNull_WhenNotFound()
    {
        // Act
        var result = await _repository.GetByIMOAsync("9999999");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIMOAsync_ShouldReturnVessel_WhenExists()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("8252427", "Test Vessel", "Test Operator", vesselType, 8, 6, 4, 2, 180.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        var result = await _repository.GetByIMOAsync("8252427");

        // Assert
        result.Should().NotBeNull();
        result!.IMO.Should().Be("8252427");
        result.VesselName.Should().Be("Test Vessel");
        result.VesselType.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByNameAsync_ShouldReturnMatchingVessels()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("8151257", "MSC Container", "MSC Shipping", vesselType, 15, 12, 6, 4, 300.0);
        var vessel2 = new Vessel("5183039", "MSC Cargo", "MSC Shipping", vesselType, 12, 10, 5, 3, 250.0);
        var vessel3 = new Vessel("8900323", "COSCO Vessel", "COSCO", vesselType, 10, 8, 4, 2, 200.0);

        await _repository.AddVesselAsync(vessel1);
        await _repository.AddVesselAsync(vessel2);
        await _repository.AddVesselAsync(vessel3);

        // Act
        var result = await _repository.GetByNameAsync("MSC");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.VesselName == "MSC Container");
        result.Should().Contain(v => v.VesselName == "MSC Cargo");
        result.Should().NotContain(v => v.VesselName == "COSCO Vessel");
    }

    [Fact]
    public async Task GetByNameAsync_ShouldReturnEmpty_WhenNoMatches()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("0005139", "Maersk Line", "Maersk", vesselType, 18, 14, 7, 5, 350.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        var result = await _repository.GetByNameAsync("EVERGREEN");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByOperatorAsync_ShouldReturnMatchingVessels()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("3617531", "Hapag Container", "Hapag-Lloyd", vesselType, 16, 12, 6, 4, 320.0);
        var vessel2 = new Vessel("1647879", "Hapag Express", "Hapag-Lloyd", vesselType, 14, 10, 5, 3, 280.0);
        var vessel3 = new Vessel("6583212", "CMA Vessel", "CMA CGM", vesselType, 12, 8, 4, 2, 240.0);

        await _repository.AddVesselAsync(vessel1);
        await _repository.AddVesselAsync(vessel2);
        await _repository.AddVesselAsync(vessel3);

        // Act
        var result = await _repository.GetByOperatorAsync("Hapag-Lloyd");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.VesselName == "Hapag Container");
        result.Should().Contain(v => v.VesselName == "Hapag Express");
        result.Should().NotContain(v => v.OperatorName == "CMA CGM");
    }

    [Fact]
    public async Task GetByOperatorAsync_ShouldReturnEmpty_WhenNoMatches()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("0743602", "OOCL Vessel", "OOCL", vesselType, 11, 9, 5, 3, 220.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        var result = await _repository.GetByOperatorAsync("YANG MING");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllVessels()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("8250003", "Vessel One", "Operator One", vesselType, 10, 8, 4, 2, 200.0);
        var vessel2 = new Vessel("5711135", "Vessel Two", "Operator Two", vesselType, 12, 10, 5, 3, 250.0);
        var vessel3 = new Vessel("8700008", "Vessel Three", "Operator Three", vesselType, 14, 12, 6, 4, 300.0);

        await _repository.AddVesselAsync(vessel1);
        await _repository.AddVesselAsync(vessel2);
        await _repository.AddVesselAsync(vessel3);

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(v => v.VesselName == "Vessel One");
        result.Should().Contain(v => v.VesselName == "Vessel Two");
        result.Should().Contain(v => v.VesselName == "Vessel Three");
    }

    [Fact]
    public async Task UpdateVesselAsync_ShouldUpdateVessel()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("5489005", "Original Name", "Original Operator", vesselType, 10, 8, 4, 2, 200.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        vessel.VesselName = "Updated Name";
        vessel.OperatorName = "Updated Operator";
        vessel.UpdateBays(15);
        await _repository.UpdateVesselAsync(vessel);

        // Assert
        var updated = await _repository.GetByIMOAsync("5489005");
        updated.Should().NotBeNull();
        updated!.VesselName.Should().Be("Updated Name");
        updated.OperatorName.Should().Be("Updated Operator");
        updated.Bays.Should().Be(15);
    }

    [Fact]
    public async Task DeleteVesselAsync_ShouldRemoveVessel()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("7318901", "Delete Me", "Delete Operator", vesselType, 8, 6, 3, 2, 150.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        await _repository.DeleteVesselAsync(vessel);

        // Assert
        var result = await _repository.GetByIMOAsync("7318901");
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIMOAsync_ShouldIncludeVesselType()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("6798001", "Type Test", "Type Operator", vesselType, 12, 10, 5, 3, 250.0);
        await _repository.AddVesselAsync(vessel);

        // Act
        var result = await _repository.GetByIMOAsync("6798001");

        // Assert
        result.Should().NotBeNull();
        result!.VesselType.Should().NotBeNull();
        result.VesselType.Name.Should().Be("Container Ship");
        result.VesselTypeName.Should().Be("Container Ship");
    }
}