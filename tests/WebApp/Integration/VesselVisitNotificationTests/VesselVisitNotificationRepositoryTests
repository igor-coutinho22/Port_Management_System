using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Infrastructure.Repositories.VesselVisits;
using FluentAssertions;

public class VesselVisitNotificationRepositoryTests
{
    private readonly PortManagementContext _context;
    private readonly VesselVisitNotificationRepository _repo;

    public VesselVisitNotificationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("VVNRepoTests")
            .Options;

        _context = new PortManagementContext(options);
        _repo = new VesselVisitNotificationRepository(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistEntity()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);

        await _repo.AddAsync(vvn);

        var retrieved = await _repo.GetByIdAsync(vvn.Id);
        retrieved.Should().NotBeNull();
        retrieved!.Purpose.Should().Be(VisitPurpose.Maintenance);
    }

    [Fact]
    public async Task UpdateAsync_ShouldChangeStatus()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);
        await _repo.AddAsync(vvn);

        vvn.MarkAsSubmitted();
        await _repo.UpdateAsync(vvn);

        var updated = await _repo.GetByIdAsync(vvn.Id);
        updated!.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllNotifications()
    {
        _context.VesselVisitNotifications.RemoveRange(_context.VesselVisitNotifications);
        await _context.SaveChangesAsync();

        await _repo.AddAsync(new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance));
        await _repo.AddAsync(new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial));

        var all = await _repo.GetAllAsync();

        all.Should().HaveCount(2);
    }
}
