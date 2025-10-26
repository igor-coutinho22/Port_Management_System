using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

public class RepresentativeServiceTests
{
    private readonly StubOrgRepo _orgRepo = new();
    private readonly StubRepRepo _repRepo = new();
    private readonly IRepresentativeService _svc;

    public RepresentativeServiceTests()
    {
        _svc = new RepresentativeService(_orgRepo, _repRepo);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreate_ForExistingOrganization()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        await _orgRepo.AddAsync(org);

        var dto = await _svc.CreateAsync(org.Id,
            new CreateRepresentativeRequest("Ana", "C1", "PT", "a@x.com", "+351911111111"));

        dto.OrganizationId.Should().Be(org.Id);
        (await _repRepo.GetByIdAsync(dto.Id)).Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenOrganizationNotFound()
    {
        var act = async () => await _svc.CreateAsync(Guid.NewGuid(),
            new CreateRepresentativeRequest("Ana", "C1", "PT", "a@x.com", "+351911111111"));
        await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("*Organization not found*");
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyRepresentative()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        await _orgRepo.AddAsync(org);
        var rep = new Representative(org.Id, "Ana", "C1", "PT", "a@x.com", "+351900000000");
        await _repRepo.AddAsync(rep);

        var updated = await _svc.UpdateAsync(rep.Id,
            new UpdateRepresentativeRequest("Ana Maria", "C2", "ES", "am@x.com", "+34900000000"));

        updated.Name.Should().Be("Ana Maria");
        (await _repRepo.GetByIdAsync(rep.Id))!.Nationality.Should().Be("ES");
    }

    [Fact]
    public async Task SetActiveAsync_ShouldToggleActive()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        await _orgRepo.AddAsync(org);
        var rep = new Representative(org.Id, "Ana", "C1", "PT", "a@x.com", "+351900000000");
        await _repRepo.AddAsync(rep);

        await _svc.SetActiveAsync(rep.Id, false);
        (await _repRepo.GetByIdAsync(rep.Id))!.IsActive.Should().BeFalse();

        await _svc.SetActiveAsync(rep.Id, true);
        (await _repRepo.GetByIdAsync(rep.Id))!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task ListAsync_ShouldFilterByActive()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        await _orgRepo.AddAsync(org);

        var a = new Representative(org.Id, "A", "C1", "PT", "a@x.com", "+3519");
        var b = new Representative(org.Id, "B", "C2", "PT", "b@x.com", "+3519");
        b.SetActive(false);
        await _repRepo.AddAsync(a); await _repRepo.AddAsync(b);

        var actives = await _svc.ListAsync(org.Id, true);
        actives.Should().OnlyContain(r => r.IsActive);

        var inactives = await _svc.ListAsync(org.Id, false);
        inactives.Should().OnlyContain(r => !r.IsActive);
    }

    // --- stubs ---
    private class StubOrgRepo : IOrganizationRepository
    {
        private readonly Dictionary<Guid, ShippingAgentOrganization> _db = new();
        public Task AddAsync(ShippingAgentOrganization org) { _db[org.Id] = org; return Task.CompletedTask; }
        public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id) => Task.FromResult(_db.TryGetValue(id, out var o) ? o : null);
        public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string tax) =>
            Task.FromResult(_db.Values.FirstOrDefault(o => o.TaxNumber == tax));
    }

    private class StubRepRepo : IRepresentativeRepository
    {
        private readonly Dictionary<Guid, Representative> _db = new();
        public Task AddAsync(Representative rep) { _db[rep.Id] = rep; return Task.CompletedTask; }
        public Task<Representative?> GetByIdAsync(Guid id) => Task.FromResult(_db.TryGetValue(id, out var r) ? r : null);
        public Task<IEnumerable<Representative>> ListByOrganizationAsync(Guid orgId, bool? active)
        {
            var q = _db.Values.Where(r => r.OrganizationId == orgId);
            if (active.HasValue) q = q.Where(r => r.IsActive == active.Value);
            return Task.FromResult(q.AsEnumerable());
        }
        public Task UpdateAsync(Representative rep) { _db[rep.Id] = rep; return Task.CompletedTask; }
    }
}
