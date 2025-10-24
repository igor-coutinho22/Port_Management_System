using WebApp.Models.Domain.Qualifications;
using FluentAssertions;

public class QualificationTests
{
    [Fact]
    public void Constructor_ShouldInitialize_WithValidValues()
    {
        var qualification = new Qualification("Q001", "Truck Driver");

        qualification.Code.Should().Be("Q001");
        qualification.Name.Should().Be("Truck Driver");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenCodeIsNull()
    {
        var act = () => new Qualification(null!, "Some Name");
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameIsEmpty()
    {
        var act = () => new Qualification("Q002", "");
        act.Should().Throw<ArgumentException>();
    }
}
