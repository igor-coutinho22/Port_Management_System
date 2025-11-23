using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Repositories.Agents
{
    public class RepresentativeRepositoryTests
{
    private readonly PortManagementContext _ctx;
    private readonly RepresentativeRepository _repo;

    public RepresentativeRepositoryTests()
    {
        var opts = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("RepRepo")
            .Options;
        _ctx = new PortManagementContext(opts);
        _repo = new RepresentativeRepository(_ctx);
    }

    private Representative Create(Guid orgId)
        => new Representative(orgId, "Alice", "CID123", "PRT", "a@mail.com", "+351911111111");

    [Fact]
    public async Task Add_And_GetById_ShouldWork()
    {
        var org = new ShippingAgentOrganization("O", "Legal", null, "Addr", "123");
        _ctx.Organizations.Add(org);
        _ctx.SaveChanges();

        var rep = Create(org.Id);
        await _repo.AddAsync(rep);

        var fetched = await _repo.GetByIdAsync(rep.Id);
        fetched!.Email.Should().Be("a@mail.com");
    }

    [Fact]
    public async Task Update_ShouldModify()
    {
        var org = new ShippingAgentOrganization("O", "Legal", null, "Addr", "123");
        _ctx.Organizations.Add(org);
        _ctx.SaveChanges();

        var rep = Create(org.Id);
        await _repo.AddAsync(rep);

        rep.UpdateEmail("new@mail.com");
        await _repo.UpdateAsync(rep);

        var fetched = await _repo.GetByIdAsync(rep.Id);
        fetched!.Email.Should().Be("new@mail.com");
    }

    [Fact]
    public async Task Delete_ShouldRemove()
    {
        var org = new ShippingAgentOrganization("O", "Legal", null, "Addr", "123");
        _ctx.Organizations.Add(org);
        _ctx.SaveChanges();

        var rep = Create(org.Id);
        await _repo.AddAsync(rep);

        await _repo.DeleteAsync(rep);

        var fetched = await _repo.GetByIdAsync(rep.Id);
        fetched.Should().BeNull();
    }
}
}
