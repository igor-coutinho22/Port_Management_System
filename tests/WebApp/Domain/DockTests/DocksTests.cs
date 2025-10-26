using System;
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
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Assert
        dock.Name.Should().Be("Main Dock");
        dock.Location.Should().Be("Pier 1");
        dock.Length.Should().Be(100);
        dock.Width.Should().Be(50);
        dock.Depth.Should().Be(15);
        dock.AllowedVesselTypes.Should().NotBeNull();
        dock.AllowedVesselTypes.Should().BeEmpty();
        dock.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsNull()
    {
        // Act & Assert
        var act = () => new Dock(null!, "Pier 1", 100, 50, 15);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        // Act & Assert
        var act = () => new Dock("", "Pier 1", 100, 50, 15);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenLocationIsNull()
    {
        // Act & Assert
        var act = () => new Dock("Main Dock", null!, 100, 50, 15);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenLocationIsEmpty()
    {
        // Act & Assert
        var act = () => new Dock("Main Dock", "", 100, 50, 15);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
    }

    [Theory]
    [InlineData(-1, 50, 15)]
    [InlineData(0, 50, 15)]
    [InlineData(100, -1, 15)]
    [InlineData(100, 0, 15)]
    [InlineData(100, 50, -1)]
    [InlineData(100, 50, 0)]
    public void Constructor_ShouldThrow_WhenDimensionsAreInvalid(double length, double width, double depth)
    {
        // Act & Assert
        var act = () => new Dock("Main Dock", "Pier 1", length, width, depth);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions must be positive values*");
    }

    [Fact]
    public void UpdateName_ShouldUpdate_WhenValidName()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act
        dock.UpdateName("Updated Dock");

        // Assert
        dock.Name.Should().Be("Updated Dock");
    }

    [Fact]
    public void UpdateName_ShouldThrow_WhenNameIsNull()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act & Assert
        var act = () => dock.UpdateName(null!);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Name cannot be null or empty (Parameter 'name')");
    }

    [Fact]
    public void UpdateLocation_ShouldUpdate_WhenValidLocation()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act
        dock.UpdateLocation("Pier 2");

        // Assert
        dock.Location.Should().Be("Pier 2");
    }

    [Fact]
    public void UpdateLocation_ShouldThrow_WhenLocationIsEmpty()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act & Assert
        var act = () => dock.UpdateLocation("");
        act.Should().Throw<ArgumentException>()
           .WithMessage("Location cannot be null or empty (Parameter 'location')");
    }

    [Fact]
    public void UpdateDimensions_ShouldUpdate_WhenValidDimensions()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act
        dock.UpdateDimensions(120, 60, 18);

        // Assert
        dock.Length.Should().Be(120);
        dock.Width.Should().Be(60);
        dock.Depth.Should().Be(18);
    }

    [Theory]
    [InlineData(-1, 60, 18)]
    [InlineData(120, -1, 18)]
    [InlineData(120, 60, -1)]
    [InlineData(0, 60, 18)]
    public void UpdateDimensions_ShouldThrow_WhenDimensionsAreInvalid(double length, double width, double depth)
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act & Assert
        var act = () => dock.UpdateDimensions(length, width, depth);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions must be positive values*");
    }

    [Fact]
    public void AllowVesselType_ShouldAdd_WhenNotAlreadyAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
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
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act & Assert
        var act = () => dock.AllowVesselType(null!);
        act.Should().Throw<ArgumentNullException>()
           .WithMessage("*vesselType*");
    }

    [Fact]
    public void AllowVesselType_ShouldThrow_WhenVesselTypeAlreadyAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
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
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
        var vesselType = CreateTestVesselType();
        dock.AllowVesselType(vesselType);

        // Act
        dock.RemoveVesselType(vesselType);

        // Assert
        dock.AllowedVesselTypes.Should().NotContain(vesselType);
        dock.AllowedVesselTypes.Should().BeEmpty();
    }

    [Fact]
    public void RemoveVesselType_ShouldThrow_WhenVesselTypeIsNull()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);

        // Act & Assert
        var act = () => dock.RemoveVesselType(null!);
        act.Should().Throw<ArgumentNullException>()
           .WithMessage("*vesselType*");
    }

    [Fact]
    public void RemoveVesselType_ShouldThrow_WhenVesselTypeNotAllowed()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
        var vesselType = CreateTestVesselType();

        // Act & Assert
        var act = () => dock.RemoveVesselType(vesselType);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*vessel type*not allowed*");
    }

    [Fact]
    public void AllowVesselType_ShouldAllowMultipleVesselTypes()
    {
        // Arrange
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
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
        var dock = new Dock("Main Dock", "Pier 1", 100, 50, 15);
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