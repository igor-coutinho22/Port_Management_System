using System;
using FluentAssertions;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Staff;
using Xunit;

public class StaffTests
{
    // ---------------------------------------------------------
    // CONSTRUCTOR
    // ---------------------------------------------------------
    [Fact]
    public void Constructor_ShouldInitializeProperties_WhenValid()
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
        staff.QualificationLinks.Should().BeEmpty();
    }

    // ---------------------------------------------------------
    // CONSTRUCTOR VALIDATION
    // ---------------------------------------------------------
    [Fact]
    public void Constructor_ShouldThrow_WhenMecanographicNumberIsEmpty()
    {
        var act = () => new Staff(
            "",
            "Name",
            "valid@port.com",
            "910000000",
            StaffStatus.Available,
            "Mon-Fri"
        );

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Mecanographic number*");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenShortNameIsEmpty()
    {
        var act = () => new Staff(
            "S002",
            "",
            "valid@port.com",
            "910000000",
            StaffStatus.Available,
            "Mon-Fri"
        );

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Short name*");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenEmailInvalid()
    {
        var act = () => new Staff(
            "S003",
            "Bob",
            "not-an-email",
            "910000000",
            StaffStatus.Available,
            "Mon-Fri"
        );

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Email format*");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenPhoneEmpty()
    {
        var act = () => new Staff(
            "S004",
            "Carol",
            "carol@port.com",
            "",
            StaffStatus.Available,
            "Mon-Fri"
        );

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Phone*");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenOperationalWindowEmpty()
    {
        var act = () => new Staff(
            "S005",
            "Dan",
            "dan@port.com",
            "900000000",
            StaffStatus.Available,
            ""
        );

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Operational window*");
    }

    // ---------------------------------------------------------
    // ACTIVATE / DEACTIVATE
    // ---------------------------------------------------------
    [Fact]
    public void Activate_ShouldSetStatusAvailable_WhenCurrentlyUnavailable()
    {
        var staff = new Staff(
            "S010",
            "Bob",
            "bob@port.com",
            "920000000",
            StaffStatus.Unavailable,
            "Mon-Fri 08:00-16:00"
        );

        staff.Activate();

        staff.Status.Should().Be(StaffStatus.Available);
    }

    [Fact]
    public void Activate_ShouldThrow_WhenAlreadyAvailable()
    {
        var staff = new Staff(
            "S011",
            "Carol",
            "carol@port.com",
            "930000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        var act = () => staff.Activate();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Staff is already active.");
    }

    [Fact]
    public void Deactivate_ShouldSetStatusUnavailable_WhenCurrentlyAvailable()
    {
        var staff = new Staff(
            "S012",
            "Dave",
            "dave@port.com",
            "940000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        staff.Deactivate();

        staff.Status.Should().Be(StaffStatus.Unavailable);
    }

    [Fact]
    public void Deactivate_ShouldThrow_WhenAlreadyUnavailable()
    {
        var staff = new Staff(
            "S013",
            "Eve",
            "eve@port.com",
            "950000000",
            StaffStatus.Unavailable,
            "Mon-Fri 08:00-16:00"
        );

        var act = () => staff.Deactivate();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Staff is already inactive.");
    }

    // ---------------------------------------------------------
    // QUALIFICATIONS: ADD
    // ---------------------------------------------------------
    [Fact]
    public void AddQualification_ShouldAddNewQualification()
    {
        var staff = new Staff(
            "S020",
            "Ana",
            "ana@port.com",
            "960000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        var q = new Qualification("QX", "Crane Operator");

        staff.AddQualification(q);

        staff.QualificationLinks.Should()
            .ContainSingle(x => x.QualificationCode == "QX");
    }

    [Fact]
    public void AddQualification_ShouldThrow_WhenDuplicate()
    {
        var staff = new Staff(
            "S021",
            "Bruno",
            "bruno@port.com",
            "970000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        var q = new Qualification("QX", "Crane Operator");

        staff.AddQualification(q);

        var act = () => staff.AddQualification(q);

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*already has qualification*");
    }

    [Fact]
    public void AddQualification_ShouldThrow_WhenExpiryBeforeObtained()
    {
        var staff = new Staff(
            "S022",
            "Carlos",
            "carlos@port.com",
            "980000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        var q = new Qualification("QY", "Forklift");

        DateOnly obtained = new DateOnly(2024, 1, 1);
        DateOnly expiry = new DateOnly(2023, 12, 31);

        var act = () => staff.AddQualification(q, obtained, expiry);

        act.Should().Throw<ArgumentException>()
           .WithMessage("*Expiry date*");
    }

    // ---------------------------------------------------------
    // QUALIFICATIONS: REMOVE
    // ---------------------------------------------------------
    [Fact]
    public void RemoveQualification_ShouldRemove_WhenPresent()
    {
        var staff = new Staff(
            "S023",
            "Diogo",
            "diogo@port.com",
            "990000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        staff.AddQualification(new Qualification("QA", "Test"));

        staff.RemoveQualification("QA");

        staff.QualificationLinks.Should().BeEmpty();
    }

    [Fact]
    public void RemoveQualification_ShouldDoNothing_WhenNotPresent()
    {
        var staff = new Staff(
            "S024",
            "Eduardo",
            "edu@port.com",
            "900000000",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );


        var act = () => staff.RemoveQualification("Missing");

        act.Should().NotThrow();

        staff.QualificationLinks.Should().BeEmpty();
    }
}
