using System;
using FluentAssertions;
using WebApp.Models.Domain.Vessels;
using Xunit;

public class VesselTypeTests
{
    [Fact]
    public void Constructor_ShouldInitialize_AllProperties()
    {
        // Arrange & Act
        var vesselType = new VesselType("Container Ship Test", "Large container vessel", 20, 18, 8);

        // Assert
        vesselType.Name.Should().Be("Container Ship Test");
        vesselType.Description.Should().Be("Large container vessel");
        vesselType.MaxBays.Should().Be(20);
        vesselType.MaxRows.Should().Be(18);
        vesselType.MaxTiers.Should().Be(8);
        vesselType.MaxTEUCapacity.Should().Be(20 * 18 * 8); // 2880
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        // Arrange & Act
        var act = () => new VesselType("", "Description", 10, 10, 5);

        // Assert
        act.Should().Throw<ArgumentException>()
           .WithMessage("Vessel type name cannot be empty. (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsNull()
    {
        // Arrange & Act
        var act = () => new VesselType(null!, "Description", 10, 10, 5);

        // Assert
        act.Should().Throw<ArgumentException>()
           .WithMessage("Vessel type name cannot be empty. (Parameter 'name')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenDuplicateNameExists()
    {
        // Arrange
        new VesselType("Bulk Carrier Test", "Dry bulk vessel", 15, 12, 6);

        // Act
        var act = () => new VesselType("Bulk Carrier Test", "Another bulk vessel", 20, 14, 7);

        // Assert
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("A vessel type with the name 'Bulk Carrier Test' already exists.");
    }

    [Fact]
    public void CreateForUpdate_ShouldCreate_WithoutAddingToRegistry()
    {
        // Arrange & Act
        var vesselType = VesselType.CreateForUpdate("Tanker Test", "Oil tanker", 12, 10, 4);

        // Assert
        vesselType.Name.Should().Be("Tanker Test");
        vesselType.Description.Should().Be("Oil tanker");
        vesselType.MaxBays.Should().Be(12);
        vesselType.MaxRows.Should().Be(10);
        vesselType.MaxTiers.Should().Be(4);
        vesselType.MaxTEUCapacity.Should().Be(480);
    }

    [Fact]
    public void UpdateMaxBays_ShouldUpdate_WhenValidValue()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act
        vesselType.UpdateMaxBays(25);

        // Assert
        vesselType.MaxBays.Should().Be(25);
    }

    [Fact]
    public void UpdateMaxBays_ShouldThrow_WhenZeroOrNegative()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act & Assert
        var act = () => vesselType.UpdateMaxBays(0);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Max bays must be greater than zero. (Parameter 'newMaxBays')");

        var act2 = () => vesselType.UpdateMaxBays(-5);
        act2.Should().Throw<ArgumentException>()
           .WithMessage("Max bays must be greater than zero. (Parameter 'newMaxBays')");
    }

    [Fact]
    public void UpdateMaxRows_ShouldUpdate_WhenValidValue()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act
        vesselType.UpdateMaxRows(22);

        // Assert
        vesselType.MaxRows.Should().Be(22);
    }

    [Fact]
    public void UpdateMaxRows_ShouldThrow_WhenZeroOrNegative()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act & Assert
        var act = () => vesselType.UpdateMaxRows(0);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Max rows must be greater than zero. (Parameter 'newMaxRows')");
    }

    [Fact]
    public void UpdateMaxTiers_ShouldUpdate_WhenValidValue()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act
        vesselType.UpdateMaxTiers(12);

        // Assert
        vesselType.MaxTiers.Should().Be(12);
    }

    [Fact]
    public void UpdateMaxTiers_ShouldThrow_WhenZeroOrNegative()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Test Ship", "Test", 10, 10, 5);

        // Act & Assert
        var act = () => vesselType.UpdateMaxTiers(-1);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Max tiers must be greater than zero. (Parameter 'newMaxTiers')");
    }

    [Fact]
    public void MaxTEUCapacity_ShouldCalculate_Correctly()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Calculate Test", "Test", 5, 4, 3);

        // Act & Assert
        vesselType.MaxTEUCapacity.Should().Be(5 * 4 * 3); // 60
    }

    [Fact]
    public void ToString_ShouldReturn_FormattedString()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Ferry Test", "Passenger ferry", 8, 6, 2);

        // Act
        var result = vesselType.ToString();

        // Assert
        result.Should().Be("Ferry Test - Passenger ferry (Max Bays: 8, Max Rows: 6, Max Tiers: 2, Max TEU Capacity: 96)");
    }
}