using System;
using FluentAssertions;
using WebApp.Models.Domain.Vessels;
using Xunit;

public class VesselTests
{
    private VesselType CreateTestVesselType()
    {
        return VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8);
    }

    [Fact]
    public void Constructor_ShouldInitialize_AllProperties()
    {
        // Arrange
        var vesselType = CreateTestVesselType();

        // Act
        var vessel = new Vessel("1234567", "MSC Vessel", "MSC Shipping", vesselType, 15, 12, 6, 4, 300.5);

        // Assert
        vessel.IMO.Should().Be("1234567");
        vessel.VesselName.Should().Be("MSC Vessel");
        vessel.OperatorName.Should().Be("MSC Shipping");
        vessel.VesselType.Should().Be(vesselType);
        vessel.VesselTypeName.Should().Be("Container Ship");
        vessel.Bays.Should().Be(15);
        vessel.Rows.Should().Be(12);
        vessel.Tiers.Should().Be(6);
        vessel.RequiredCraneCount.Should().Be(4);
        vessel.RequiredDockLength.Should().Be(300.5);
        vessel.CargoGrid.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenIMOIsInvalid()
    {
        // Arrange
        var vesselType = CreateTestVesselType();

        // Act & Assert
        var act = () => new Vessel("123456", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Invalid IMO (Parameter 'imo')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenVesselTypeIsNull()
    {
        // Act & Assert
        var act = () => new Vessel("1234567", "Test Vessel", "Test Operator", null!, 10, 10, 5, 2, 200.0);
        act.Should().Throw<ArgumentNullException>()
           .WithMessage("Value cannot be null. (Parameter 'vesselType')");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenDimensionsExceedVesselTypeMaximum()
    {
        // Arrange
        var vesselType = VesselType.CreateForUpdate("Small Ship", "Small vessel", 5, 4, 3);

        // Act & Assert - exceeding max bays
        var act1 = () => new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 3, 2, 2, 200.0);
        act1.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");

        // Act & Assert - exceeding max rows
        var act2 = () => new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 4, 10, 2, 2, 200.0);
        act2.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");

        // Act & Assert - exceeding max tiers
        var act3 = () => new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 4, 3, 10, 2, 200.0);
        act3.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");
    }

    [Theory]
    [InlineData("1234567", true)]   // Valid IMO
    [InlineData("9074729", true)]   // Valid IMO
    [InlineData("123456", false)]   // Too short
    [InlineData("12345678", false)] // Too long
    [InlineData("123456a", false)]  // Contains letter
    [InlineData("1234568", false)]  // Invalid check digit
    [InlineData("", false)]         // Empty
    [InlineData("   ", false)]      // Whitespace
    public void IsValidIMO_ShouldValidate_Correctly(string imo, bool expected)
    {
        // Act
        var result = Vessel.IsValidIMO(imo);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void UpdateBays_ShouldUpdate_WhenValidDimensions()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act
        vessel.UpdateBays(18);

        // Assert
        vessel.Bays.Should().Be(18);
    }

    [Fact]
    public void UpdateBays_ShouldThrow_WhenExceedsMaximum()
    {
        // Arrange
        var vesselType = CreateTestVesselType(); // Max bays = 20
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act & Assert
        var act = () => vessel.UpdateBays(25); // Exceeds max of 20
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");
    }

    [Fact]
    public void UpdateRows_ShouldUpdate_WhenValidDimensions()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act
        vessel.UpdateRows(16);

        // Assert
        vessel.Rows.Should().Be(16);
    }

    [Fact]
    public void UpdateRows_ShouldThrow_WhenExceedsMaximum()
    {
        // Arrange
        var vesselType = CreateTestVesselType(); // Max rows = 18
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act & Assert
        var act = () => vessel.UpdateRows(20); // Exceeds max of 18
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");
    }

    [Fact]
    public void UpdateTiers_ShouldUpdate_WhenValidDimensions()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act
        vessel.UpdateTiers(7);

        // Assert
        vessel.Tiers.Should().Be(7);
    }

    [Fact]
    public void UpdateTiers_ShouldThrow_WhenExceedsMaximum()
    {
        // Arrange
        var vesselType = CreateTestVesselType(); // Max tiers = 8
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act & Assert
        var act = () => vessel.UpdateTiers(10); // Exceeds max of 8
        act.Should().Throw<ArgumentException>()
           .WithMessage("Dimensions exceed maximum allowed for this vessel type.");
    }

    [Fact]
    public void ValidateDimensions_ShouldNotThrow_WhenWithinLimits()
    {
        // Arrange
        var vesselType = CreateTestVesselType();
        var vessel = new Vessel("1234567", "Test Vessel", "Test Operator", vesselType, 10, 10, 5, 2, 200.0);

        // Act & Assert - should not throw
        var act = () => vessel.ValidateDimensions(15, 12, 6);
        act.Should().NotThrow();
    }
}