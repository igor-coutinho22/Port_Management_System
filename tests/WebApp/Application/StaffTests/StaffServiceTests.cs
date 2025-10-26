using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Application.Services.StaffService;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Staff.Interfaces;
using Xunit;


public class StaffServiceTests
{
    private readonly StubStaffRepository _repo = new();
    private readonly StaffService _service;

    public StaffServiceTests()
    {
        _service = new StaffService(_repo);
    }

    [Fact]
    public async Task RegisterStaffAsync_ShouldAdd_WhenNew()
    {
        await _service.RegisterStaffAsync("S001", "Alice", "alice@port.com", "910000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");

        var stored = await _repo.GetByMecanographicNumberAsync("S001");
        stored.Should().NotBeNull();
        stored!.ShortName.Should().Be("Alice");
    }

    [Fact]
    public async Task RegisterStaffAsync_ShouldThrow_WhenDuplicateMecNumber()
    {
        await _repo.AddAsync(new Staff("S002", "Bob", "bob@port.com", "920000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00"));

        var act = async () => await _service.RegisterStaffAsync("S002", "Bobby", "bobby@port.com", "921111111",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");

        await act.Should().ThrowAsync<ArgumentException>()
                 .WithMessage("*already exists*");
    }

    [Fact]
    public async Task ActivateAsync_ShouldChangeStatus()
    {
        await _repo.AddAsync(new Staff("S003", "Carol", "carol@port.com", "930000000",
            StaffStatus.Unavailable, "Mon-Fri 08:00-16:00"));

        await _service.ActivateAsync("S003");
        (await _repo.GetByMecanographicNumberAsync("S003"))!.Status.Should().Be(StaffStatus.Available);
    }

    [Fact]
    public async Task DeactivateAsync_ShouldChangeStatus()
    {
        await _repo.AddAsync(new Staff("S004", "Dave", "dave@port.com", "940000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00"));

        await _service.DeactivateAsync("S004");
        (await _repo.GetByMecanographicNumberAsync("S004"))!.Status.Should().Be(StaffStatus.Unavailable);
    }

    [Fact]
    public async Task AddQualificationToStaffAsync_ShouldAppendLink()
    {
        await _repo.AddAsync(new Staff("S005", "Eve", "eve@port.com", "950000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00"));

        var q = new Qualification("Q1", "Crane Operator");
        await _service.AddQualificationToStaffAsync("S005", q);

        var staff = await _repo.GetByMecanographicNumberAsync("S005");
        staff!.QualificationLinks.Should().ContainSingle(l => l.QualificationCode == "Q1");
    }

    [Fact]
    public async Task RemoveQualificationFromStaffAsync_ShouldRemoveIfPresent()
    {
        var s = new Staff("S006", "Frank", "frank@port.com", "960000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");
        s.QualificationLinks.Add(new QualificationLink("S006", "QX"));
        await _repo.AddAsync(s);

        await _service.RemoveQualificationFromStaffAsync("S006", "QX");

        var staff = await _repo.GetByMecanographicNumberAsync("S006");
        staff!.QualificationLinks.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchAsync_ShouldFilterByNameStatusAndQualification()
    {
        var a = new Staff("S007", "Ana", "ana@port.com", "970000000",
            StaffStatus.Available, "Mon-Fri 08:00-16:00");
        var b = new Staff("S008", "Bruno", "bruno@port.com", "980000000",
            StaffStatus.Unavailable, "Mon-Fri 08:00-16:00");
        b.QualificationLinks.Add(new QualificationLink("S008", "QX"));

        await _repo.AddAsync(a);
        await _repo.AddAsync(b);

        var onlyUnavailable = await _service.SearchAsync(null, StaffStatus.Unavailable, null);
        onlyUnavailable.Should().ContainSingle(x => x.MecanographicNumber == "S008");

        var withQX = await _service.SearchAsync(null, null, "QX");
        withQX.Should().ContainSingle(x => x.MecanographicNumber == "S008");

        var byName = await _service.SearchAsync("Ana", null, null);
        byName.Should().ContainSingle(x => x.MecanographicNumber == "S007");
    }

    //
    // Minimal in-memory stub that implements the methods the service calls
    //
private sealed class StubStaffRepository : IStaffRepository
{
    private readonly Dictionary<string, Staff> _db = new();

    public void Add(Staff staff) => _db[staff.MecanographicNumber] = staff;

    public Task AddAsync(Staff staff)
    {
        _db[staff.MecanographicNumber] = staff;
        return Task.CompletedTask;
    }

    public Staff? GetByMecanographicNumber(string mecanographicNumber) =>
        _db.TryGetValue(mecanographicNumber, out var s) ? s : null;

    public Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber) =>
        Task.FromResult(GetByMecanographicNumber(mecanographicNumber));

    public List<Staff> GetAll() => _db.Values.ToList();

    public Task<List<Staff>> GetAllAsync() =>
        Task.FromResult(GetAll());

    public List<Staff> GetByStatus(StaffStatus status) =>
        _db.Values.Where(s => s.Status == status).ToList();

    public Task<List<Staff>> GetByStatusAsync(StaffStatus status) =>
        Task.FromResult(GetByStatus(status));

    public List<Staff> Search(string? name, StaffStatus? status, string? qualificationCode)
    {
        IEnumerable<Staff> q = _db.Values;

        if (!string.IsNullOrWhiteSpace(name))
            q = q.Where(s => s.ShortName != null &&
                             s.ShortName.Contains(name, StringComparison.OrdinalIgnoreCase));

        if (status.HasValue)
            q = q.Where(s => s.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(qualificationCode))
            q = q.Where(s => s.QualificationLinks
                .Any(l => l.QualificationCode == qualificationCode));

        return q.ToList();
    }

    public Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode) =>
        Task.FromResult(Search(name, status, qualificationCode));

    public void Update(Staff staff) => _db[staff.MecanographicNumber] = staff;

    public Task UpdateAsync(Staff staff)
    {
        Update(staff);
        return Task.CompletedTask;
    }

    public void Delete(string mecanographicNumber) => _db.Remove(mecanographicNumber);

    public Task DeleteAsync(string mecanographicNumber)
    {
        Delete(mecanographicNumber);
        return Task.CompletedTask;
    }
}

}