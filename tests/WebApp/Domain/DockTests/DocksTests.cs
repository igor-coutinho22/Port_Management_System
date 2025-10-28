using System;
using System.Collections.Generic;
using FluentAssertions;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels.VesselType;
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
    public void Constructor_ShouldThrow_WhenNameIsNull()
    {
        // Act & Assert
        var act = () => new Dock(null!, "Pier 1", 100, 50, 15, new List<VesselType>());
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        // Act & Assert
        var act = () => new Dock("", "Pier 1", 100, 50, 15, new List<VesselType>());
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenLocationIsNull()
    {
        // Act & Assert
        var act = () => new Dock("Main Dock", null!, 100, 50, 15, new List<VesselType>());
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenLocationIsEmpty()
    {
        // Act & Assert
        var act = () => new Dock("Main Dock", "", 100, 50, 15, new List<VesselType>());
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
    }

    [Fact]
    public void UpdateName_ShouldUpdate_WhenValidName()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act
        dock.Name = "Updated Dock";

        // Assert
        dock.Name.Should().Be("Updated Dock");
    }

    [Fact]
    public void UpdateName_ShouldThrow_WhenNameIsNull()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.Name = null!;
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void UpdateLocation_ShouldUpdate_WhenValidLocation()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act
        dock.Location = "Pier 2";

        // Assert
        dock.Location.Should().Be("Pier 2");
    }

    [Fact]
    public void UpdateLocation_ShouldThrow_WhenLocationIsEmpty()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.Location = "";
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
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
    [InlineData(120)]
    [InlineData(0)]
    public void UpdateLength_ShouldThrow_WhenLengthIsInvalid(double length)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateLength(length);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions must be positive values*");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(120)]
    [InlineData(0)]
    public void UpdateWidth_ShouldThrow_WhenDepthIsInvalid(double depth)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateDepth(depth);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions must be positive values*");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(120)]
    [InlineData(0)]
    public void UpdateMaxDraft_ShouldThrow_WhenMaxDraftIsInvalid(double maxDraft)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.UpdateMaxDraft(maxDraft);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions must be positive values*");
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
    public void AllowVesselType_ShouldThrow_WhenVesselTypeIsNull()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.AllowVesselType(null!);
        act.Should().Throw<ArgumentNullException>()
           .WithMessage("*vesselType*");
    }

    [Fact]
    public void AllowVesselType_ShouldThrow_WhenVesselTypeAlreadyAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();
        dock.AllowVesselType(vesselType);

        // Act & Assert
        var act = () => dock.AllowVesselType(vesselType);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*vessel type*already allowed*");
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
    public void RemoveVesselType_ShouldThrow_WhenVesselTypeIsNull()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());

        // Act & Assert
        var act = () => dock.RemoveVesselType(null!);
        act.Should().Throw<ArgumentNullException>()
           .WithMessage("*vesselType*");
    }

    [Fact]
    public void RemoveVesselType_ShouldThrow_WhenVesselTypeNotAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();

        // Act & Assert
        var act = () => dock.RemoveVesselType(vesselType.Name);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*vessel type*not allowed*");
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
    public void ToString_ShouldReturn_FormattedString()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15, new List<VesselType>());
        var vesselType = CreateTestVesselType();
        dock.AllowVesselType(vesselType);

        // Act
        var result = dock.ToString();

        // Assert
        result.Should().Contain("Main Dock");
        result.Should().Contain("Pier 1");
        result.Should().Contain("100");
        result.Should().Contain("50");
        result.Should().Contain("15");
    }
}