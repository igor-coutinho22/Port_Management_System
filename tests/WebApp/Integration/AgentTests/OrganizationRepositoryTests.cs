using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

public class OrganizationRepositoryTests
{
    private readonly PortManagementContext _ctx;
    private readonly OrganizationRepository _repo;

    public OrganizationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("OrgRepoTests_DB").Options;
        _ctx = new PortManagementContext(options);
        _repo = new OrganizationRepository(_ctx);
    }

    [Fact]
    public async Task AddAsync_And_GetById_ShouldReturnOrganization_WithRepresentatives()
    {
        var org = new ShippingAgentOrganization("SEA & CO", null, "Rua A", "PT123");
        org.AddRepresentative(new Representative(org.Id, "Ana", "C1", "PT", "a@x.com", "+3519"));
        await _repo.AddAsync(org);

        var found = await _repo.GetByIdAsync(org.Id);
        found.Should().NotBeNull();
        found!.Representatives.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetByTaxNumberAsync_ShouldFindCorrectOrganization()
    {
        var org = new ShippingAgentOrganization("Y", null, "Rua B", "PT999");
        await _repo.AddAsync(org);

        var found = await _repo.GetByTaxNumberAsync("PT999");
        found.Should().NotBeNull();
        found!.LegalName.Should().Be("Y");
    }
}
