using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Application.Services.VesselService;
using WebApp.Models.Application.Services;
using Xunit;

public class VesselServiceTests
{
    private readonly StubVesselRepository _vesselRepo;
    private readonly StubVesselTypeService _vesselTypeService;
    private readonly VesselService _service;

    public VesselServiceTests()
    {
        _vesselRepo = new StubVesselRepository();
        _vesselTypeService = new StubVesselTypeService();
        _service = new VesselService(_vesselRepo, _vesselTypeService);
    }

    private VesselType CreateTestVesselType()
    {
        return VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
    }

    [Fact]
    public async Task RegisterVesselAsync_ShouldAdd_WhenValid()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("1234567", "MSC Vessel", "MSC Shipping", vesselType, 15, 12, 6, 4, 300.5);

        // Act
        await _service.RegisterVesselAsync(vessel);

        // Assert
        var result = await _vesselRepo.GetByIMOAsync("1234567");
        result.Should().NotBeNull();
        result!.VesselName.Should().Be("MSC Vessel");
        result.OperatorName.Should().Be("MSC Shipping");
    }

    [Fact]
    public async Task RegisterVesselAsync_ShouldThrow_WhenDuplicateIMO()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("2345678", "First Vessel", "First Operator", vesselType, 10, 10, 5, 2, 200.0);
        var vessel2 = new Vessel("2345678", "Second Vessel", "Second Operator", vesselType, 12, 8, 4, 3, 250.0);

        await _vesselRepo.AddVesselAsync(vessel1);

        // Act & Assert
        var act = async () => await _service.RegisterVesselAsync(vessel2);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task RegisterVesselAsync_ShouldThrow_WhenNull()
    {
        // Act & Assert
        var act = async () => await _service.RegisterVesselAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task GetVesselByIMOAsync_ShouldReturn_WhenExists()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("3456789", "Test Vessel", "Test Operator", vesselType, 8, 6, 4, 2, 180.0);
        await _vesselRepo.AddVesselAsync(vessel);

        // Act
        var result = await _service.GetVesselByIMOAsync("3456789");

        // Assert
        result.Should().NotBeNull();
        result!.IMO.Should().Be("3456789");
        result.VesselName.Should().Be("Test Vessel");
    }

    [Fact]
    public async Task GetVesselByIMOAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _service.GetVesselByIMOAsync("9999999");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetVesselByNameAsync_ShouldReturnMatches()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("4567890", "MSC Container", "MSC Shipping", vesselType, 15, 12, 6, 4, 300.0);
        var vessel2 = new Vessel("5678901", "MSC Cargo", "MSC Shipping", vesselType, 12, 10, 5, 3, 250.0);
        var vessel3 = new Vessel("6789012", "COSCO Vessel", "COSCO", vesselType, 10, 8, 4, 2, 200.0);

        await _vesselRepo.AddVesselAsync(vessel1);
        await _vesselRepo.AddVesselAsync(vessel2);
        await _vesselRepo.AddVesselAsync(vessel3);

        // Act
        var result = await _service.GetVesselByNameAsync("MSC");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.VesselName == "MSC Container");
        result.Should().Contain(v => v.VesselName == "MSC Cargo");
    }

    [Fact]
    public async Task GetVesselsByOperatorAsync_ShouldReturnMatches()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("7890123", "Hapag Container", "Hapag-Lloyd", vesselType, 16, 12, 6, 4, 320.0);
        var vessel2 = new Vessel("8901234", "Hapag Express", "Hapag-Lloyd", vesselType, 14, 10, 5, 3, 280.0);
        var vessel3 = new Vessel("9012345", "CMA Vessel", "CMA CGM", vesselType, 12, 8, 4, 2, 240.0);

        await _vesselRepo.AddVesselAsync(vessel1);
        await _vesselRepo.AddVesselAsync(vessel2);
        await _vesselRepo.AddVesselAsync(vessel3);

        // Act
        var result = await _service.GetVesselsByOperatorAsync("Hapag-Lloyd");

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.VesselName == "Hapag Container");
        result.Should().Contain(v => v.VesselName == "Hapag Express");
    }

    [Fact]
    public async Task GetAllVesselsAsync_ShouldReturnAll()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel1 = new Vessel("0123456", "Vessel One", "Operator One", vesselType, 10, 8, 4, 2, 200.0);
        var vessel2 = new Vessel("1234567", "Vessel Two", "Operator Two", vesselType, 12, 10, 5, 3, 250.0);

        await _vesselRepo.AddVesselAsync(vessel1);
        await _vesselRepo.AddVesselAsync(vessel2);

        // Act
        var result = await _service.GetAllVesselsAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.VesselName == "Vessel One");
        result.Should().Contain(v => v.VesselName == "Vessel Two");
    }

    [Fact]
    public async Task UpdateVesselAsync_ShouldUpdate_WhenExists()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var originalVessel = new Vessel("2468135", "Original Name", "Original Operator", vesselType, 10, 8, 4, 2, 200.0);
        await _vesselRepo.AddVesselAsync(originalVessel);

        var updatedVessel = new Vessel("2468135", "Updated Name", "Updated Operator", vesselType, 15, 12, 6, 4, 350.0);

        // Act
        await _service.UpdateVesselAsync(updatedVessel);

        // Assert
        var result = await _vesselRepo.GetByIMOAsync("2468135");
        result.Should().NotBeNull();
        result!.VesselName.Should().Be("Updated Name");
        result.OperatorName.Should().Be("Updated Operator");
        result.Bays.Should().Be(15);
        result.Rows.Should().Be(12);
        result.Tiers.Should().Be(6);
    }

    [Fact]
    public async Task UpdateVesselAsync_ShouldThrow_WhenNull()
    {
        // Act & Assert
        var act = async () => await _service.UpdateVesselAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task UpdateVesselAsync_ShouldThrow_WhenNotFound()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("9999999", "Nonexistent", "Does not exist", vesselType, 10, 8, 4, 2, 200.0);

        // Act & Assert
        var act = async () => await _service.UpdateVesselAsync(vessel);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task DeleteVesselAsync_ShouldRemove_WhenExists()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("3579246", "Delete Me", "Delete Operator", vesselType, 8, 6, 3, 2, 150.0);
        await _vesselRepo.AddVesselAsync(vessel);

        // Act
        await _service.DeleteVesselAsync("3579246");

        // Assert
        var result = await _vesselRepo.GetByIMOAsync("3579246");
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteVesselAsync_ShouldThrow_WhenNotFound()
    {
        // Act & Assert
        var act = async () => await _service.DeleteVesselAsync("9999999");
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    // Nested Stub Repository
    private class StubVesselRepository : IVesselRepository
    {
        private readonly List<Vessel> _vessels = new();

        public Task AddVesselAsync(Vessel vessel)
        {
            var exists = _vessels.Any(v => v.IMO == vessel.IMO);
            if (exists)
                throw new ArgumentException("A vessel with this IMO number already exists.");

            _vessels.Add(vessel);
            return Task.CompletedTask;
        }

        public Task UpdateVesselAsync(Vessel vessel)
        {
            var existing = _vessels.FirstOrDefault(v => v.IMO == vessel.IMO);
            if (existing != null)
            {
                existing.VesselName = vessel.VesselName;
                existing.OperatorName = vessel.OperatorName;
                existing.VesselType = vessel.VesselType;
                existing.UpdateBays(vessel.Bays);
                existing.UpdateRows(vessel.Rows);
                existing.UpdateTiers(vessel.Tiers);
                existing.RequiredCraneCount = vessel.RequiredCraneCount;
                existing.RequiredDockLength = vessel.RequiredDockLength;
            }
            return Task.CompletedTask;
        }

        public Task<Vessel> GetByIMOAsync(string imo)
            => Task.FromResult(_vessels.FirstOrDefault(v => v.IMO == imo));

        public Task<List<Vessel>> GetByNameAsync(string name)
            => Task.FromResult(_vessels.Where(v => v.VesselName.Contains(name)).ToList());

        public Task<List<Vessel>> GetByOperatorAsync(string operatorName)
            => Task.FromResult(_vessels.Where(v => v.OperatorName == operatorName).ToList());

        public Task<List<Vessel>> GetAllAsync()
            => Task.FromResult(_vessels.ToList());

        public Task DeleteVesselAsync(Vessel vessel)
        {
            _vessels.RemoveAll(v => v.IMO == vessel.IMO);
            return Task.CompletedTask;
        }
    }

    // Nested Stub Service
    private class StubVesselTypeService : IVesselTypeService
    {
        public Task<List<VesselType>> GetAllVesselTypesAsync() => Task.FromResult(new List<VesselType>());
        public Task<VesselType> GetVesselTypeByNameAsync(string name) => Task.FromResult<VesselType>(null);
        public Task<List<VesselType>> SearchVesselTypesByNameAsync(string partialName) => Task.FromResult(new List<VesselType>());
        public Task<List<VesselType>> SearchVesselTypesByDescriptionAsync(string keyword) => Task.FromResult(new List<VesselType>());
        public Task AddVesselTypeAsync(VesselType vesselType) => Task.CompletedTask;
        public Task UpdateVesselTypeAsync(VesselType vesselType) => Task.CompletedTask;
        public Task DeleteVesselTypeAsync(string name) => Task.CompletedTask;
    }
}