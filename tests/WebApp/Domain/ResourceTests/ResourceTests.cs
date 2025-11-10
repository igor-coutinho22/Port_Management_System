using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Qualifications;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;

public class ResourceTests
{
    [Fact]
    public void Constructor_ShouldInitializeAllProperties()
    {
        var q = new Qualification("Q1", "Crane License");
        var qualifications = new HashSet<Qualification> { q };

        var resource = new Resource("R001", "STS Crane", ResourceType.STSCrane, 100, ResourceAvailabilityStatus.Active, 10, qualifications);

        resource.Id.Should().Be("R001");
        resource.Description.Should().Be("STS Crane");
        resource.ResourceType.Should().Be(ResourceType.STSCrane);
        resource.OperationalCapacity.Should().Be(100);
        resource.Status.Should().Be(ResourceAvailabilityStatus.Active);
        resource.SetupTime.Should().Be(10);
        resource.QualificationRequirements.Should().Contain(q);
    }

    [Fact]
    public void Resource_ShouldAllowStatusChange()
    {
        var resource = new Resource("R002", "Truck", ResourceType.Truck, 50, ResourceAvailabilityStatus.Active, 5, new());
        resource.Status = ResourceAvailabilityStatus.UnderMaintenance;

        resource.Status.Should().Be(ResourceAvailabilityStatus.UnderMaintenance);
    }
}
