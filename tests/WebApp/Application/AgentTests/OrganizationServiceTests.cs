using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

public class OrganizationServiceTests
{
    private readonly StubOrgRepo _orgRepo;
    private readonly IOrganizationService _svc;

    public OrganizationServiceTests()
    {
        _orgRepo = new StubOrgRepo();
        _svc = new OrganizationService(_orgRepo);
    }

    [Fact]
    public async Task CreateAsync_ShouldPersist_WithAtLeastOneRepresentative()
    {
        var req = new CreateOrganizationRequest(
            "SEA & CO", null, "Rua A", "PT123456780",
            new[] { new CreateRepresentativeRequest("Ana", "C1", "PT", "ana@sea.co", "+351911111111") });

        var dto = await _svc.CreateAsync(req);

        dto.Id.Should().NotBeEmpty();
        (await _orgRepo.GetByIdAsync(dto.Id)).Should().NotBeNull();
        (await _orgRepo.GetByIdAsync(dto.Id))!.Representatives.Should().HaveCount(1);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenNoRepresentatives()
    {
        var req = new CreateOrganizationRequest("SEA & CO", null, "Rua A", "PT123456781", Enumerable.Empty<CreateRepresentativeRequest>());
        var act = async () => await _svc.CreateAsync(req);
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("*At least one representative*");
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenTaxNumberAlreadyExists()
    {
        var existing = new ShippingAgentOrganization("X", null, "Rua", "PT999999990");
        await _orgRepo.AddAsync(existing);

        var req = new CreateOrganizationRequest(
            "SEA & CO", null, "Rua A", "PT999999990",
            new[] { new CreateRepresentativeRequest("Ana", "C1", "PT", "ana@sea.co", "+351911111111") });

        var act = async () => await _svc.CreateAsync(req);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task GetAsync_ShouldReturn_OrganizationDto()
    {
        var org = new ShippingAgentOrganization("Y", null, "Rua B", "PT000000000");
        await _orgRepo.AddAsync(org);

        var dto = await _svc.GetAsync(org.Id);
        dto.LegalName.Should().Be("Y");
        dto.TaxNumber.Should().Be("PT000000000");
    }

    // --- stub repo ---
    private class StubOrgRepo : IOrganizationRepository
    {
        private readonly Dictionary<Guid, ShippingAgentOrganization> _db = new();
        public Task AddAsync(ShippingAgentOrganization org) { _db[org.Id] = org; return Task.CompletedTask; }
        public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id) => Task.FromResult(_db.TryGetValue(id, out var o) ? o : null);
        public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string tax) =>
            Task.FromResult(_db.Values.FirstOrDefault(o => o.TaxNumber == tax));
    }
}
