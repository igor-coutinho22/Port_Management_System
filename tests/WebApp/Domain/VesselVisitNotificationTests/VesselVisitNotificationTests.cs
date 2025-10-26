using WebApp.Models.Domain.VesselVisits;
using FluentAssertions;
using Xunit;
using System;

public class VesselVisitNotificationTests
{
    [Fact]
    public void Constructor_ShouldInitializeCorrectly_WithPurpose()
    {
        var vesselId = Guid.NewGuid();
        var dockId = Guid.NewGuid();
        var visitDate = DateTime.UtcNow;

        var vvn = new VesselVisitNotification(vesselId, dockId, visitDate, VisitPurpose.Maintenance);

        vvn.VesselId.Should().Be(vesselId);
        vvn.DockId.Should().Be(dockId);
        vvn.VisitDate.Should().Be(visitDate);
        vvn.Purpose.Should().Be(VisitPurpose.Maintenance);
        vvn.Status.Should().Be(VesselVisitStatus.InProgress);
        vvn.Crew.Should().BeEmpty();
        vvn.LoadingManifest.Should().BeNull();
        vvn.UnloadingManifest.Should().BeNull();
    }

    [Fact]
    public void AddLoadingManifest_ShouldAssignManifest_WhenTypeIsLoading()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        var manifest = new CargoManifest(CargoManifestType.Loading);

        vvn.AddLoadingManifest(manifest);

        vvn.LoadingManifest.Should().Be(manifest);
    }

    [Fact]
    public void AddLoadingManifest_ShouldThrow_WhenTypeIsUnloading()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        var invalidManifest = new CargoManifest(CargoManifestType.Unloading);

        Action act = () => vvn.AddLoadingManifest(invalidManifest);

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*Loading*");
    }

    [Fact]
    public void AddUnloadingManifest_ShouldAssignManifest_WhenTypeIsUnloading()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        var manifest = new CargoManifest(CargoManifestType.Unloading);

        vvn.AddUnloadingManifest(manifest);

        vvn.UnloadingManifest.Should().Be(manifest);
    }

    [Fact]
    public void AddUnloadingManifest_ShouldThrow_WhenTypeIsLoading()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        var invalidManifest = new CargoManifest(CargoManifestType.Loading);

        Action act = () => vvn.AddUnloadingManifest(invalidManifest);

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*Unloading*");
    }

    [Fact]
    public void AddCrewMember_ShouldAppendCrew()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);

        vvn.AddCrewMember("John Doe", "CIT123", "Portuguese");

        vvn.Crew.Should().ContainSingle(c =>
            c.Name == "John Doe" &&
            c.CitizenId == "CIT123" &&
            c.Nationality == "Portuguese");
    }

    [Fact]
    public void MarkAsSubmitted_ShouldSucceed_ForMaintenance_WithNoManifests()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);

        vvn.MarkAsSubmitted();

        vvn.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public void MarkAsSubmitted_ShouldThrow_ForCommercial_WithNoManifests()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);

        Action act = () => vvn.MarkAsSubmitted();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*Commercial visits must have at least one cargo manifest*");
    }

    [Fact]
    public void MarkAsSubmitted_ShouldSucceed_ForCommercial_WithLoadingManifest()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));

        vvn.MarkAsSubmitted();

        vvn.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public void MarkAsSubmitted_ShouldThrow_WhenAlreadySubmitted()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);
        vvn.MarkAsSubmitted();

        Action act = () => vvn.MarkAsSubmitted();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*InProgress*");
    }

    [Fact]
    public void MarkAsSubmitted_ShouldSucceed_WithBothManifests()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));
        vvn.AddUnloadingManifest(new CargoManifest(CargoManifestType.Unloading));

        vvn.MarkAsSubmitted();

        vvn.Status.Should().Be(VesselVisitStatus.Submitted);
    }
}
