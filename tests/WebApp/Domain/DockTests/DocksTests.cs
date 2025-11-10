using System;
using System.Collections.Generic;
using FluentAssertions;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels;
using Xunit;

public class DocksTests
{
    private VesselType CreateTestVesselType()
    {
        return VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
    }

    [Fact]
    public void Constructor_ShouldInitialize_AllProperties()
    {
        // Arrange & Act
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Assert
        dock.Name.Should().Be("Main Dock");
        dock.Location.Should().Be("Pier 1");
        dock.LengthMeters.Should().Be(100);
        dock.DepthMeters.Should().Be(50);
        dock.MaxDraftMeters.Should().Be(15);
        dock.AllowedVesselTypes.Should().NotBeNull();
        dock.AllowedVesselTypes.Should().BeEmpty();
        dock.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void UpdateDimensions_ShouldUpdate_WhenValidDimensions()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act
        dock.UpdateLength(120);
        dock.UpdateDepth(60);
        dock.UpdateMaxDraft(18);

        // Assert
        dock.LengthMeters.Should().Be(120);
        dock.DepthMeters.Should().Be(60);
        dock.MaxDraftMeters.Should().Be(18);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void UpdateLength_ShouldThrow_WhenLengthIsInvalid(double length)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateLength(length);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Length must be a positive value*");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void UpdateDepth_ShouldThrow_WhenDepthIsInvalid(double depth)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateDepth(depth);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Depth must be a positive value*");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void UpdateMaxDraft_ShouldThrow_WhenMaxDraftIsInvalid(double maxDraft)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateMaxDraft(maxDraft);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Max draft must be a positive value*");
    }

    [Fact]
    public void AllowVesselType_ShouldAdd_WhenNotAlreadyAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();

        // Act
        dock.AllowVesselType(vesselType);

        // Assert
        dock.AllowedVesselTypes.Should().Contain(vesselType);
        dock.AllowedVesselTypes.Should().HaveCount(1);
    }

    [Fact]
    public void AllowVesselType_ShouldNotAddDuplicate_WhenVesselTypeAlreadyAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();
        dock.AllowVesselType(vesselType);

        // Act
        dock.AllowVesselType(vesselType); // Should not add duplicate

        // Assert
        dock.AllowedVesselTypes.Should().HaveCount(1);
        dock.AllowedVesselTypes.Should().Contain(vesselType);
    }

    [Fact]
    public void RemoveVesselType_ShouldRemove_WhenVesselTypeIsAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();
        dock.AllowVesselType(vesselType);

        // Act
        dock.RemoveVesselType(vesselType.Name);

        // Assert
        dock.AllowedVesselTypes.Should().NotContain(vesselType);
        dock.AllowedVesselTypes.Should().BeEmpty();
    }

    [Fact]
    public void AllowVesselType_ShouldAllowMultipleVesselTypes()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType1 = VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
        var vesselType2 = VesselType.CreateForUpdate("Bulk Carrier", "Dry bulk vessel", 15, 12, 6);

        // Act
        dock.AllowVesselType(vesselType1);
        dock.AllowVesselType(vesselType2);

        // Assert
        dock.AllowedVesselTypes.Should().HaveCount(2);
        dock.AllowedVesselTypes.Should().Contain(vesselType1);
        dock.AllowedVesselTypes.Should().Contain(vesselType2);
    }

    [Fact]
    public void Update_ShouldUpdateAllProperties()
    {
        // Arrange
        var dock = new Dock("Old Dock", "Old Pier", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();
        var newVesselTypes = new List<VesselType> { vesselType };

        // Act
        dock.Update("New Dock", "New Pier", 200, 80, 20, newVesselTypes);

        // Assert
        dock.Name.Should().Be("New Dock");
        dock.Location.Should().Be("New Pier");
        dock.LengthMeters.Should().Be(200);
        dock.DepthMeters.Should().Be(80);
        dock.MaxDraftMeters.Should().Be(20);
        dock.AllowedVesselTypes.Should().HaveCount(1);
        dock.AllowedVesselTypes.Should().Contain(vesselType);
    }
}