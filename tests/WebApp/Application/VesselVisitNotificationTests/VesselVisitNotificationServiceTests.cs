using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain;
using WebApp.Models.Domain.Docks;
using Xunit;
using WebApp.Models.Domain.Vessels;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Agents;
using Microsoft.Kiota.Abstractions;

public class VesselVisitNotificationServiceTests
{
    private readonly StubVesselVisitNotificationRepository _vesselVisitRepo;
    private readonly StubVesselRepository _vesselRepo;
    private readonly StubDockRepository _dockRepo;
    private readonly StubOrganizationRepository _organizationRepo;
    private readonly VesselVisitNotificationService _service;
    private const string ValidIMO = "1234567";
    private DateTime future = DateTime.UtcNow.Date.AddDays(1);

    public VesselVisitNotificationServiceTests()
    {
        _vesselVisitRepo = new StubVesselVisitNotificationRepository();
        _vesselRepo = new StubVesselRepository();
        _dockRepo = new StubDockRepository();
        _organizationRepo = new StubOrganizationRepository();
        _service = new VesselVisitNotificationService(_vesselVisitRepo, _vesselRepo, _dockRepo, _organizationRepo);
    }
    /*
        [Fact]
        public async Task CreateAsync_ShouldCreate_WhenValidDTO()
        {
            // Arrange
            var dockId = Guid.NewGuid();
            var dto = new VesselVisitNotificationDTO
            {
                VesselIMO = ValidIMO,
                DockId = dockId,
                VisitDate = DateTime.UtcNow.Date.AddDays(1),
                Purpose = VisitPurpose.Commercial.ToString(),
                LoadingManifest = new CargoManifestDTO { Type = CargoManifestType.Loading.ToString() }
            };

            // Act
            var created = VesselVisitNotificationMapper.ToEntity(dto);
            await _service.CreateAsync(created);

            // Assert
            created.Should().NotBeNull();
            created.VesselIMO.Should().Be(ValidIMO);
            created.DockId.Should().Be(dockId);
            created.Purpose.Should().Be(VisitPurpose.Commercial);
            created.Status.Should().Be(VesselVisitStatus.InProgress);
        }
    */
    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenVesselNotFound()
    {
        // Arrange
        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = "nonexistent",
            DockId = Guid.NewGuid(),
            VisitDate = future,
            Purpose = VisitPurpose.Commercial.ToString(),
            ArrivalTime = future.AddHours(8),
            DesiredDepartureTime = future.AddHours(18),
            EstimatedLoadingDurationMinutes = 60,
            EstimatedUnloadingDurationMinutes = 60
        };

        // Act & Assert
        var created = VesselVisitNotificationMapper.ToEntity(dto);
        var act = async () => await _service.CreateAsync(created);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Vessel with IMO*not found.");
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenDockNotFound()
    {
        // Arrange
        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = ValidIMO,
            DockId = Guid.Empty, // This will cause dock not found
            VisitDate = future,
            Purpose = VisitPurpose.Commercial.ToString(),
            ArrivalTime = future.AddHours(8),
            DesiredDepartureTime = future.AddHours(18),
            EstimatedLoadingDurationMinutes = 60,
            EstimatedUnloadingDurationMinutes = 60
        };

        // Act & Assert
        var created = VesselVisitNotificationMapper.ToEntity(dto);
        var act = async () => await _service.CreateAsync(created);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Dock with ID*not found.");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAll_VesselVisitNotifications()
    {
        // Arrange
        var dockId1 = Guid.NewGuid();
        var dockId2 = Guid.NewGuid();
        var date1 = DateTime.UtcNow.Date.AddDays(1);
        var date2 = DateTime.UtcNow.Date.AddDays(2);
        var vvn1 = new VesselVisitNotification(Guid.NewGuid(), ValidIMO, dockId1, date1, VisitPurpose.Commercial, date1.AddHours(2), date1.AddHours(4), 60, 60);
        var vvn2 = new VesselVisitNotification(Guid.NewGuid(), "2345674", dockId2, date2.AddDays(2), VisitPurpose.Maintenance, date2.AddHours(2), date2.AddHours(4), 60, 60);

        await _vesselVisitRepo.AddAsync(vvn1);
        await _vesselVisitRepo.AddAsync(vvn2);

        // Act
        var results = await _service.GetAllAsync();

        // Assert
        results.Should().HaveCount(2);
        results.Should().Contain(r => r.VesselIMO == ValidIMO);
        results.Should().Contain(r => r.VesselIMO == "2345674");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturn_WhenExists()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var date = DateTime.UtcNow.Date.AddDays(1);
        var vvn = new VesselVisitNotification(Guid.NewGuid(), ValidIMO, dockId, date, VisitPurpose.Commercial, date.AddHours(2), date.AddHours(4), 60, 60);
        await _vesselVisitRepo.AddAsync(vvn);

        // Act
        var result = await _service.GetByIdAsync(vvn.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(vvn.Id);
        result.VesselIMO.Should().Be(ValidIMO);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _service.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdate_ExistingVesselVisitNotification()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var dockId = Guid.NewGuid();
        var date = DateTime.UtcNow.Date.AddDays(1);
        var vvn = new VesselVisitNotification(orgId, ValidIMO, dockId, date, VisitPurpose.Commercial, date.AddHours(2), date.AddHours(4), 60, 60);
        await _vesselVisitRepo.AddAsync(vvn);

        var updatedVvn = new VesselVisitNotification(orgId, ValidIMO, dockId, date, VisitPurpose.Maintenance, date.AddHours(3), date.AddHours(5), 70, 70);

        // Act
        await _service.UpdateAsync(vvn.Id, updatedVvn);

        // Assert
        var updated = await _vesselVisitRepo.GetByIdAsync(vvn.Id);
        updated.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenNotFound()
    {
        // Arrange
        var date = DateTime.UtcNow.Date.AddDays(1);
        var updatedVvn = new VesselVisitNotification(Guid.NewGuid(), ValidIMO, Guid.NewGuid(), date, VisitPurpose.Maintenance, date.AddHours(3), date.AddHours(5), 70, 70);

        // Act & Assert
        var act = async () => await _service.UpdateAsync(Guid.NewGuid(), updatedVvn);
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Vessel Visit Notification not found.");
    }

    [Fact]
    public async Task SubmitAsync_ShouldSubmit_ValidVesselVisitNotification()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var dockId = Guid.NewGuid();
        var date = DateTime.UtcNow.Date.AddDays(1);
        var vvn = new VesselVisitNotification(orgId, ValidIMO, dockId, date, VisitPurpose.Maintenance, date.AddHours(1), date.AddHours(3), 50, 50);
        await _vesselVisitRepo.AddAsync(vvn);

        // Act
        await _service.SubmitAsync(vvn.Id);

        // Assert
        var updated = await _vesselVisitRepo.GetByIdAsync(vvn.Id);
        updated!.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public async Task SubmitAsync_ShouldThrow_WhenNotFound()
    {
        // Act & Assert
        var act = async () => await _service.SubmitAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Vessel Visit Notification not found.");
    }

    [Fact]
    public async Task SearchAsync_ShouldReturnFiltered_ByVesselIMO()
    {
        // Arrange
        const string searchIMO = "9876543";
        var dockId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var date = DateTime.UtcNow.Date.AddDays(1);
        var vvn1 = new VesselVisitNotification(orgId, searchIMO, dockId, date, VisitPurpose.Commercial, date.AddHours(2), date.AddHours(4), 60, 60);
        var vvn2 = new VesselVisitNotification(orgId, ValidIMO, dockId, date, VisitPurpose.Maintenance, date.AddHours(2), date.AddHours(4), 60, 60);
        var vvn3 = new VesselVisitNotification(orgId, searchIMO, dockId, date.AddDays(1), VisitPurpose.Commercial, date.AddHours(2), date.AddHours(4), 60, 60);

        await _vesselVisitRepo.AddAsync(vvn1);
        await _vesselVisitRepo.AddAsync(vvn2);
        await _vesselVisitRepo.AddAsync(vvn3);

        var filter = new VesselVisitNotificationFilterDTO { VesselIMO = searchIMO };

        // Act
        var results = await _service.SearchAsync(filter);

        // Assert
        results.Should().HaveCount(2);
        results.Should().AllSatisfy(r => r.VesselIMO.Should().Be(searchIMO));
    }

    [Fact]
    public async Task SearchAsync_ShouldReturnFiltered_ByStatus()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var date = DateTime.UtcNow.Date.AddDays(1);
        var vvn1 = new VesselVisitNotification(orgId, ValidIMO, dockId, date, VisitPurpose.Maintenance, date.AddHours(1), date.AddHours(3), 50, 50);
        var vvn2 = new VesselVisitNotification(orgId, "2345674", dockId, date, VisitPurpose.Commercial, date.AddHours(1), date.AddHours(3), 50, 50);
        vvn1.MarkAsSubmitted(); // Change status to Submitted

        await _vesselVisitRepo.AddAsync(vvn1);
        await _vesselVisitRepo.AddAsync(vvn2);

        var filter = new VesselVisitNotificationFilterDTO { Status = "Submitted" };

        // Act
        var results = await _service.SearchAsync(filter);

        // Assert
        results.Should().HaveCount(1);
        results.Should().AllSatisfy(r => r.Status.Should().Be("Submitted"));
    }

    [Fact]
    public async Task SearchAsync_ShouldReturnFiltered_ByDateRange()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var baseDate = DateTime.UtcNow.Date;
        var vvn1 = new VesselVisitNotification(orgId, ValidIMO, dockId, baseDate, VisitPurpose.Commercial, baseDate.AddHours(2), baseDate.AddHours(4), 60, 60);
        var vvn2 = new VesselVisitNotification(orgId, "2345674", dockId, baseDate.AddDays(2), VisitPurpose.Maintenance, baseDate.AddHours(2), baseDate.AddHours(4), 60, 60);
        var vvn3 = new VesselVisitNotification(orgId, "3456781", dockId, baseDate.AddDays(5), VisitPurpose.Commercial, baseDate.AddHours(2), baseDate.AddHours(4), 60, 60);
        await _vesselVisitRepo.AddAsync(vvn1);
        await _vesselVisitRepo.AddAsync(vvn2);
        await _vesselVisitRepo.AddAsync(vvn3);

        var filter = new VesselVisitNotificationFilterDTO
        {
            FromDate = baseDate.AddDays(-1),
            ToDate = baseDate.AddDays(3)
        };

        // Act
        var results = await _service.SearchAsync(filter);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task SearchAsync_ShouldThrow_WhenNoFilterProvided()
    {
        // Arrange
        var filter = new VesselVisitNotificationFilterDTO();

        // Act & Assert
        var act = async () => await _service.SearchAsync(filter);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("At least one search parameter must be provided.");
    }

    // Stub implementations
    private class StubVesselVisitNotificationRepository : IVesselVisitNotificationRepository
    {
        private readonly List<VesselVisitNotification> _notifications = new();

        public Task<VesselVisitNotification?> GetByIdAsync(Guid id)
        {
            return Task.FromResult(_notifications.FirstOrDefault(v => v.Id == id));
        }

        public Task<IEnumerable<VesselVisitNotification>> GetAllAsync()
        {
            return Task.FromResult<IEnumerable<VesselVisitNotification>>(_notifications.ToList());
        }

        public Task AddAsync(VesselVisitNotification notification)
        {
            _notifications.Add(notification);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(VesselVisitNotification notification)
        {
            var existing = _notifications.FirstOrDefault(v => v.Id == notification.Id);
            if (existing != null)
            {
                _notifications.Remove(existing);
                _notifications.Add(notification);
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(VesselVisitNotification notification)
        {
            _notifications.Remove(notification);
            return Task.CompletedTask;
        }

        // Implement new interface methods
        public Task SaveLMAsync(CargoManifest manifest)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task SaveUMAsync(CargoManifest manifest)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task SaveCMAsync(CrewMember crewMember)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task DeleteLMAsync(CargoManifest manifest)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task DeleteUMAsync(CargoManifest manifest)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task DeleteCMAsync(CrewMember crewMember)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task UpdateStatusToApprovedAsync(VesselVisitNotification notification, DecisionLog decisionLog)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task UpdateStatusToRejectedAsync(VesselVisitNotification notification, DecisionLog decisionLog)
        {
            // Stub: do nothing
            return Task.CompletedTask;
        }

        public Task<IEnumerable<VesselVisitNotification>> GetAllOnOrgAsync(Guid organizationId)
        {
            // Stub: return all notifications for simplicity
            return Task.FromResult<IEnumerable<VesselVisitNotification>>(_notifications.ToList());
        }
    }

    private class StubVesselRepository : IVesselRepository
    {
        public Task<Vessel?> GetByIMOAsync(string imo)
        {
            if (imo == ValidIMO || imo == "2345678" || imo == "9876543" || imo == "3456789")
            {
                // Return a mock vessel for valid IMOs
                var vesselType = CreateMockVesselType();
                return Task.FromResult(new Vessel(imo, "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0))!;
            }
            return Task.FromResult<Vessel?>(null);
        }

        private VesselType CreateMockVesselType()
        {
            return VesselType.CreateForUpdate("Container Ship", "Test vessel type", 20, 18, 8);
        }

        public Task<Vessel> GetByIdAsync(string id) => throw new NotImplementedException();
        public Task<List<Vessel>> GetAllAsync() => throw new NotImplementedException();
        public Task AddVesselAsync(Vessel vessel) => throw new NotImplementedException();
        public Task UpdateVesselAsync(Vessel vessel) => throw new NotImplementedException();
        public Task<List<Vessel>> GetByNameAsync(string name) => throw new NotImplementedException();
        public Task<List<Vessel>> GetByOperatorAsync(string operatorName) => throw new NotImplementedException();
        public Task DeleteVesselAsync(Vessel vessel) => throw new NotImplementedException();
    }

    private class StubDockRepository : IDockRepository
    {
        public Task<Dock?> GetByIdAsync(Guid id)
        {
            if (id != Guid.Empty)
            {
                // Return a mock dock for non-empty GUIDs
                return Task.FromResult(new Dock("Test Dock", "Commercial", 100.0, 50.0, 10.0, new List<VesselType>()))!;
            }
            return Task.FromResult<Dock?>(null);
        }

        public Task<List<Dock>> GetAllAsync() => throw new NotImplementedException();
        public Task AddAsync(Dock dock) => throw new NotImplementedException();
        public Task UpdateAsync(Dock dock) => throw new NotImplementedException();
        public Task DeleteAsync(Dock dock) => throw new NotImplementedException();
        public Task<List<Dock>> SearchByNameAsync(string name) => throw new NotImplementedException();
        public Task<Dock?> GetByNameAsync(string name) => throw new NotImplementedException();
        public Task<Dock?> GetByLocationAsync(string location) => throw new NotImplementedException();
        public Task<List<Dock>> SearchByVesselTypeAsync(string vesselType) => throw new NotImplementedException();
        public Task<List<Dock>> SearchByLocationAsync(string location) => throw new NotImplementedException();
    }

    private class StubOrganizationRepository : IOrganizationRepository
    {
        public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id)
        {
            // Stub: return a mock organization for any GUID
            return Task.FromResult(new ShippingAgentOrganization("TST- Test", "Test Company", "TEST", "Test Address", "12345"))!;
        }

        public Task<List<ShippingAgentOrganization>> GetAllAsync() => throw new NotImplementedException();
        public Task AddAsync(ShippingAgentOrganization organization) => throw new NotImplementedException();
        public Task UpdateAsync(ShippingAgentOrganization organization) => throw new NotImplementedException();
        public Task DeleteAsync(ShippingAgentOrganization organization) => throw new NotImplementedException();

        public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber)
        {
            throw new NotImplementedException();
        }

        public Task AddOrRemoveRepresentativeAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber)
        {
            throw new NotImplementedException();
        }
    }
}