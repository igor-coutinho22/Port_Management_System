using System;
using FluentAssertions;
using WebApp.Models.Domain.Staff;
using Xunit;

public class StaffTests
{
    [Fact]
    public void Constructor_ShouldInitialize_AllProperties()
    {
        var staff = new Staff(
            "S001",
            "Alice",
            "alice@port.com",
            "910000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        staff.MecanographicNumber.Should().Be("S001");
        staff.ShortName.Should().Be("Alice");
        staff.Email.Should().Be("alice@port.com");
        staff.Phone.Should().Be("910000000");
        staff.Status.Should().Be(StaffStatus.Available);
        staff.OperationalWindow.Should().Be("Mon-Fri 08:00-16:00");
        staff.QualificationLinks.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void Activate_ShouldSetStatusAvailable_WhenCurrentlyUnavailable()
    {
        var staff = new Staff("S002", "Bob", "bob@port.com", "920000000",
            StaffStatus.Unavailable, "Mon-Fri 08:00-16:00");

        staff.Activate();

        staff.Status.Should().Be(StaffStatus.Available);
    }

    [Fact]
    public void Activate_ShouldThrow_WhenAlreadyAvailable()
    {
        var staff = new Staff("S003", "Carol", "carol@port.com", "930000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");

        var act = () => staff.Activate();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Staff is already active.");
    }

    [Fact]
    public void Deactivate_ShouldSetStatusUnavailable_WhenCurrentlyAvailable()
    {
        var staff = new Staff("S004", "Dave", "dave@port.com", "940000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");

        staff.Deactivate();

        staff.Status.Should().Be(StaffStatus.Unavailable);
    }

    [Fact]
    public void Deactivate_ShouldThrow_WhenAlreadyUnavailable()
    {
        var staff = new Staff("S005", "Eve", "eve@port.com", "950000000",
            StaffStatus.Unavailable, "Mon-Fri 08:00-16:00");

        var act = () => staff.Deactivate();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Staff is already inactive.");
    }
}
