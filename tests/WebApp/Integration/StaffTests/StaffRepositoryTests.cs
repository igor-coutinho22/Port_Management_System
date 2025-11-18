using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Infrastructure.Repositories.StaffRepository;
using Xunit;

public class StaffRepositoryTests
{
    private readonly PortManagementContext _ctx;
    private readonly StaffRepository _repo;

    public StaffRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("StaffRepoTestsDB")
            .Options;

        _ctx = new PortManagementContext(options);
        _repo = new StaffRepository(_ctx);
    }

    // -------------------------------------------------------
    // ADD + GET
    // -------------------------------------------------------
    [Fact]
    public async Task AddAsync_And_GetByMec_ShouldPersistAndRetrieve()
    {
        var s = new Staff(
            "S010",
            "Ines",
            "ines@port.com",
            "910000001",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        await _repo.AddAsync(s);

        var fetched = await _repo.GetByMecanographicNumberAsync("S010");
        fetched.Should().NotBeNull();
        fetched!.ShortName.Should().Be("Ines");
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------
    [Fact]
    public async Task UpdateAsync_ShouldPersistChanges()
    {
        var s = new Staff(
            "S011",
            "Leo",
            "leo@port.com",
            "920000001",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        await _repo.AddAsync(s);

        s.Phone = "999999999";
        await _repo.UpdateAsync(s);

        var fetched = await _repo.GetByMecanographicNumberAsync("S011");
        fetched!.Phone.Should().Be("999999999");
    }

    // -------------------------------------------------------
    // SEARCH (status + qualification)
    // -------------------------------------------------------
    [Fact]
    public async Task SearchAsync_ShouldFilterByStatus_And_Qualification()
    {
        var a = new Staff(
            "S012",
            "Ana",
            "ana@port.com",
            "930000001",
            StaffStatus.Unavailable,
            "Mon-Fri 08:00-16:00"
        );

        var b = new Staff(
            "S013",
            "Bruno",
            "bruno@port.com",
            "940000001",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        // Add qualification using domain method, not manual list insertion:
        b.AddQualification(new Qualification("QX", "Crane Operator"));

        await _repo.AddAsync(a);
        await _repo.AddAsync(b);

        // --- By status ---
        var onlyUnavailable = await _repo.GetByStatusAsync(StaffStatus.Unavailable);
        onlyUnavailable.Should().ContainSingle(s => s.MecanographicNumber == "S012");

        // --- By qualification ---
        var withQX = await _repo.SearchAsync(null, null, "QX");
        withQX.Should().ContainSingle(s => s.MecanographicNumber == "S013");
    }

    // -------------------------------------------------------
    // DELETE
    // -------------------------------------------------------
    [Fact]
    public async Task DeleteAsync_ShouldRemoveEntity()
    {
        var s = new Staff(
            "S014",
            "Carl",
            "carl@port.com",
            "950000001",
            StaffStatus.Available,
            "Mon-Fri 08:00-16:00"
        );

        await _repo.AddAsync(s);

        await _repo.DeleteAsync("S014");

        var result = await _repo.GetByMecanographicNumberAsync("S014");
        result.Should().BeNull();
    }
}
