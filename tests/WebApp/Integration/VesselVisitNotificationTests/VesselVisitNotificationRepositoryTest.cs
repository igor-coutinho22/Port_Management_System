using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Infrastructure.Repositories;
using FluentAssertions;
using Xunit;
using System;
using System.Threading.Tasks;
using System.Linq;

public class VesselVisitNotificationRepositoryTest
{
    private readonly PortManagementContext _context;
    private readonly VesselVisitNotificationRepository _repository;
    private const string ValidIMO = "1234567";

    public VesselVisitNotificationRepositoryTest()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Use unique DB name for isolation
            .Options;

        _context = new PortManagementContext(options);
        _repository = new VesselVisitNotificationRepository(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistVesselVisitNotification()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        var vvn = new VesselVisitNotification(ValidIMO, dockId, visitDate, VisitPurpose.Commercial);

        // Act
        await _repository.AddAsync(vvn);
        await _context.SaveChangesAsync();

        // Assert
        var result = await _repository.GetByIdAsync(vvn.Id);
        result.Should().NotBeNull();
        result!.VesselIMO.Should().Be(ValidIMO);
        result.DockId.Should().Be(dockId);
        result.Purpose.Should().Be(VisitPurpose.Commercial);
        result.Status.Should().Be(VesselVisitStatus.InProgress);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllVesselVisitNotifications()
    {
        // Arrange
        var dockId1 = Guid.NewGuid();
        var dockId2 = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        
        var vvn1 = new VesselVisitNotification(ValidIMO, dockId1, visitDate, VisitPurpose.Commercial);
        var vvn2 = new VesselVisitNotification("2345674", dockId2, visitDate.AddDays(1), VisitPurpose.Maintenance);
        
        await _repository.AddAsync(vvn1);
        await _repository.AddAsync(vvn2);
        await _context.SaveChangesAsync();

        // Act
        var results = await _repository.GetAllAsync();

        // Assert
        results.Should().HaveCount(2);
        results.Should().Contain(v => v.Id == vvn1.Id);
        results.Should().Contain(v => v.Id == vvn2.Id);
    }

    [Fact]
    public async Task Repository_ShouldFilterVisitsByIMO_UsingGetAllAsync()
    {
        // Arrange
        const string specificIMO = "9876531";
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        
        var vvn1 = new VesselVisitNotification(specificIMO, dockId, visitDate, VisitPurpose.Commercial);
        var vvn2 = new VesselVisitNotification("1111117", dockId, visitDate, VisitPurpose.Maintenance);
        var vvn3 = new VesselVisitNotification(specificIMO, dockId, visitDate.AddDays(1), VisitPurpose.Commercial);
        
        await _repository.AddAsync(vvn1);
        await _repository.AddAsync(vvn2);
        await _repository.AddAsync(vvn3);

        // Act
        var allResults = await _repository.GetAllAsync();
        var filteredResults = allResults.Where(v => v.VesselIMO == specificIMO).ToList();

        // Assert
        filteredResults.Should().HaveCount(2);
        filteredResults.Should().AllSatisfy(v => v.VesselIMO.Should().Be(specificIMO));
    }

    [Fact]
    public async Task Repository_ShouldFilterVisitsByStatus_UsingGetAllAsync()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        
        var vvn1 = new VesselVisitNotification(ValidIMO, dockId, visitDate, VisitPurpose.Commercial);
        var vvn2 = new VesselVisitNotification("2345674", dockId, visitDate, VisitPurpose.Maintenance);
        var vvn3 = new VesselVisitNotification("3456781", dockId, visitDate, VisitPurpose.Commercial);
        
        // Submit one of them
        vvn2.MarkAsSubmitted();
        
        await _repository.AddAsync(vvn1);
        await _repository.AddAsync(vvn2);
        await _repository.AddAsync(vvn3);

        // Act
        var allResults = await _repository.GetAllAsync();
        var inProgressResults = allResults.Where(v => v.Status == VesselVisitStatus.InProgress).ToList();
        var submittedResults = allResults.Where(v => v.Status == VesselVisitStatus.Submitted).ToList();

        // Assert
        inProgressResults.Should().HaveCount(2);
        inProgressResults.Should().AllSatisfy(v => v.Status.Should().Be(VesselVisitStatus.InProgress));
        
        submittedResults.Should().HaveCount(1);
        submittedResults.Should().AllSatisfy(v => v.Status.Should().Be(VesselVisitStatus.Submitted));
    }

    [Fact]
    public async Task Repository_ShouldFilterVisitsByDateRange_UsingGetAllAsync()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var baseDate = DateTime.UtcNow.Date;
        
        var vvn1 = new VesselVisitNotification(ValidIMO, dockId, baseDate.AddDays(3), VisitPurpose.Commercial);
        var vvn2 = new VesselVisitNotification("2345674", dockId, baseDate, VisitPurpose.Maintenance);
        var vvn3 = new VesselVisitNotification("3456781", dockId, baseDate.AddDays(2), VisitPurpose.Commercial);
        var vvn4 = new VesselVisitNotification("4567898", dockId, baseDate.AddDays(5), VisitPurpose.Maintenance);
        
        await _repository.AddAsync(vvn1);
        await _repository.AddAsync(vvn2);
        await _repository.AddAsync(vvn3);
        await _repository.AddAsync(vvn4);

        // Act
        var allResults = await _repository.GetAllAsync();
        var filteredResults = allResults.Where(v => v.VisitDate >= baseDate.AddDays(-1) && v.VisitDate <= baseDate.AddDays(3)).ToList();

        // Assert
        filteredResults.Should().HaveCount(3);
        filteredResults.Should().Contain(v => v.Id == vvn1.Id);
        filteredResults.Should().Contain(v => v.Id == vvn2.Id);
        filteredResults.Should().Contain(v => v.Id == vvn3.Id);
    }

    [Fact]
    public async Task Repository_ShouldHandleComplexVisitWithManifestsAndCrew()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        
        var vvn = new VesselVisitNotification(ValidIMO, dockId, visitDate, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));
        vvn.AddUnloadingManifest(new CargoManifest(CargoManifestType.Unloading));
        vvn.AddCrewMember(new CrewMember("Captain", "CIT001", "PT"));
        vvn.AddCrewMember(new CrewMember("Engineer", "CIT002", "ES"));
        
        await _repository.AddAsync(vvn);
        await _context.SaveChangesAsync();

        // Act
        var result = await _context.VesselVisitNotifications
            .Include(v => v.LoadingManifest)
            .Include(v => v.UnloadingManifest)
            .Include(v => v.Crew)
            .FirstOrDefaultAsync(v => v.Id == vvn.Id);

        // Assert
        result.Should().NotBeNull();
        result!.LoadingManifest.Should().NotBeNull();
        result.UnloadingManifest.Should().NotBeNull();
        result.Crew.Should().HaveCount(2);
        result.Crew.Should().Contain(c => c.Name == "Captain");
        result.Crew.Should().Contain(c => c.Name == "Engineer");
    }

    [Fact]
    public async Task Repository_ShouldHandleUpdateOperations()
    {
        // Arrange
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;
        var vvn = new VesselVisitNotification(ValidIMO, dockId, visitDate, VisitPurpose.Commercial);
        
        await _repository.AddAsync(vvn);
        await _context.SaveChangesAsync();

        // Act - Test various update operations
        var newDockId = Guid.NewGuid();
        var newDate = visitDate.AddDays(1);

        vvn.UpdateDockId(newDockId);
        vvn.UpdateVisitDate(newDate);
        vvn.UpdatePurpose(VisitPurpose.Maintenance);

        await _repository.UpdateAsync(vvn);
        await _context.SaveChangesAsync();

        // Assert
        var updated = await _repository.GetByIdAsync(vvn.Id);
        updated.Should().NotBeNull();
        updated!.VesselIMO.Should().Be(ValidIMO); // IMO should remain unchanged
        updated.DockId.Should().Be(newDockId);
        updated.VisitDate.Should().Be(newDate);
        updated.Purpose.Should().Be(VisitPurpose.Maintenance);
    }
}