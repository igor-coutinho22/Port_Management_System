using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Repositories.Agents
{
    public class OrganizationRepositoryTests
{
    private readonly PortManagementContext _ctx;
    private readonly OrganizationRepository _repo;

    public OrganizationRepositoryTests()
    {
        var opts = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("OrgRepo")
            .Options;
        _ctx = new PortManagementContext(opts);
        _repo = new OrganizationRepository(_ctx);
    }

    private ShippingAgentOrganization CreateOrg(string id = "ORG1")
        => new ShippingAgentOrganization(id, "Legal", null, "Addr", "123456");

    [Fact]
    public async Task Add_And_GetById_ShouldWork()
    {
        var org = CreateOrg();
        await _repo.AddAsync(org);

        var fetched = await _repo.GetByIdAsync(org.Id);
        fetched!.Identifier.Should().Be("ORG1");
    }

    [Fact]
    public async Task Update_ShouldModify()
    {
        var org = CreateOrg();
        await _repo.AddAsync(org);

        org.UpdateProfile("ALT", "UPDATED");

        await _repo.UpdateAsync(org);

        var fetched = await _repo.GetByIdAsync(org.Id);
        fetched!.Address.Should().Be("UPDATED");
    }

    [Fact]
    public async Task Search_ShouldReturnMatches()
    {
        var o1 = new ShippingAgentOrganization("AAA", "Alpha", null, "Addr", "111");
        var o2 = new ShippingAgentOrganization("BBB", "Beta", null, "Addr", "222");

        await _repo.AddAsync(o1);
        await _repo.AddAsync(o2);

        var list = await _repo.SearchAsync("Alpha", null);
        list.Should().ContainSingle(x => x.Identifier == "AAA");
    }
}
}
