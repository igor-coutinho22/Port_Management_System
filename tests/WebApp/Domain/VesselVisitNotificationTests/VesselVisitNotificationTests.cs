using WebApp.Models.Domain.VesselVisits;
using FluentAssertions;
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;

public class VesselVisitNotificationTests
{
    private const string ValidIMO = "1234567";
    private readonly Guid _validDockId = Guid.NewGuid();
    private readonly DateTime _validVisitDate = DateTime.UtcNow;

    [Fact]
    public void Constructor_ShouldInitialize_AllProperties()
    {
        // Act
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);

        // Assert
        vvn.Id.Should().NotBeEmpty();
        vvn.VesselIMO.Should().Be(ValidIMO);
        vvn.DockId.Should().Be(_validDockId);
        vvn.VisitDate.Should().Be(_validVisitDate);
        vvn.Purpose.Should().Be(VisitPurpose.Commercial);
        vvn.Status.Should().Be(VesselVisitStatus.InProgress);
        vvn.LoadingManifest.Should().BeNull();
        vvn.UnloadingManifest.Should().BeNull();
        vvn.Crew.Should().BeEmpty();
    }



    [Fact]
    public void AddLoadingManifest_ShouldAdd_WhenTypeIsLoading()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var manifest = new CargoManifest(CargoManifestType.Loading);

        // Act
        vvn.AddLoadingManifest(manifest);

        // Assert
        vvn.LoadingManifest.Should().Be(manifest);
    }

    [Fact]
    public void AddLoadingManifest_ShouldThrow_WhenTypeIsUnloading()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var invalidManifest = new CargoManifest(CargoManifestType.Unloading);

        // Act & Assert
        var act = () => vvn.AddLoadingManifest(invalidManifest);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Loading");
    }

    [Fact]
    public void AddUnloadingManifest_ShouldAdd_WhenTypeIsUnloading()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var manifest = new CargoManifest(CargoManifestType.Unloading);

        // Act
        vvn.AddUnloadingManifest(manifest);

        // Assert
        vvn.UnloadingManifest.Should().Be(manifest);
    }

    [Fact]
    public void AddUnloadingManifest_ShouldThrow_WhenTypeIsLoading()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var invalidManifest = new CargoManifest(CargoManifestType.Loading);

        // Act & Assert
        var act = () => vvn.AddUnloadingManifest(invalidManifest);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Unloading");
    }

    [Fact]
    public void AddCrewMember_ShouldAdd_ValidCrewMember()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);

        // Act
        vvn.AddCrewMember(new CrewMember("John Doe", "CIT123", "PT"));

        // Assert
        vvn.Crew.Should().ContainSingle(c =>
            c.Name == "John Doe" &&
            c.CitizenId == "CIT123" &&
            c.Nationality == "PT");
    }

    [Fact]
    public void MarkAsSubmitted_ShouldChangeStatus_ForMaintenanceVisit()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Maintenance);

        // Act
        vvn.MarkAsSubmitted();

        // Assert
        vvn.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public void MarkAsSubmitted_ShouldThrow_ForCommercialVisitWithoutManifests()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);

        // Act & Assert
        var act = () => vvn.MarkAsSubmitted();
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("cargo manifest");
    }

    [Fact]
    public void MarkAsSubmitted_ShouldSucceed_ForCommercialVisitWithLoadingManifest()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));

        // Act
        vvn.MarkAsSubmitted();

        // Assert
        vvn.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public void MarkAsSubmitted_ShouldThrow_WhenAlreadySubmitted()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Maintenance);
        vvn.MarkAsSubmitted();

        // Act & Assert
        var act = () => vvn.MarkAsSubmitted();
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("InProgress");
    }

    [Fact]
    public void UpdatePurpose_ShouldUpdate_WhenStatusIsInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);

        // Act
        vvn.UpdatePurpose(VisitPurpose.Maintenance);

        // Assert
        vvn.Purpose.Should().Be(VisitPurpose.Maintenance);
    }

    [Fact]
    public void UpdatePurpose_ShouldThrow_WhenStatusIsNotInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));
        vvn.MarkAsSubmitted();

        // Act & Assert
        var act = () => vvn.UpdatePurpose(VisitPurpose.Maintenance);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("InProgress");
    }

    [Fact]
    public void UpdateDockId_ShouldUpdate_WhenStatusIsInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var newDockId = Guid.NewGuid();

        // Act
        vvn.UpdateDockId(newDockId);

        // Assert
        vvn.DockId.Should().Be(newDockId);
    }

    [Fact]
    public void UpdateVisitDate_ShouldUpdate_WhenStatusIsInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var newDate = _validVisitDate.AddDays(1);

        // Act
        vvn.UpdateVisitDate(newDate);

        // Assert
        vvn.VisitDate.Should().Be(newDate);
    }

    [Fact]
    public void UpdateLoadingManifest_ShouldUpdate_WhenStatusIsInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var newManifest = new CargoManifest(CargoManifestType.Loading);

        // Act
        vvn.UpdateLoadingManifest(newManifest);

        // Assert
        vvn.LoadingManifest.Should().Be(newManifest);
    }

    [Fact]
    public void UpdateLoadingManifest_ShouldSetToNull_WhenPassedNull()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));

        // Act
        vvn.UpdateLoadingManifest(null);

        // Assert
        vvn.LoadingManifest.Should().BeNull();
    }

    [Fact]
    public void UpdateLoadingManifest_ShouldThrow_WhenManifestTypeIsIncorrect()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        var wrongManifest = new CargoManifest(CargoManifestType.Unloading);

        // Act & Assert
        var act = () => vvn.UpdateLoadingManifest(wrongManifest);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Loading");
    }

    [Fact]
    public void UpdateCrew_ShouldReplaceCrew_WhenStatusIsInProgress()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        vvn.AddCrewMember(new CrewMember("Original", "CIT001", "PT"));
        
        var newCrew = new List<CrewMember>
        {
            new CrewMember("John Doe", "CIT123", "US"),
            new CrewMember("Jane Smith", "CIT456", "UK")
        };

        // Act
        vvn.UpdateCrew(newCrew);

        // Assert
        vvn.Crew.Should().HaveCount(2);
        vvn.Crew.Should().Contain(c => c.Name == "John Doe");
        vvn.Crew.Should().Contain(c => c.Name == "Jane Smith");
        vvn.Crew.Should().NotContain(c => c.Name == "Original");
    }

    [Fact]
    public void UpdateCrew_ShouldClearCrew_WhenPassedEmptyList()
    {
        // Arrange
        var vvn = new VesselVisitNotification(ValidIMO, _validDockId, _validVisitDate, VisitPurpose.Commercial);
        vvn.AddCrewMember(new CrewMember("John Doe", "CIT123", "PT"));

        // Act
        vvn.UpdateCrew(new List<CrewMember>());

        // Assert
        vvn.Crew.Should().BeEmpty();
    }
}