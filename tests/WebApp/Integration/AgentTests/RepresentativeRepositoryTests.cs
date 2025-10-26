using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

public class RepresentativeRepositoryTests
{
    private readonly PortManagementContext _ctx;
    private readonly RepresentativeRepository _repo;

    public RepresentativeRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase("RepRepoTests_DB").Options;
        _ctx = new PortManagementContext(options);
        _repo = new RepresentativeRepository(_ctx);
    }

    [Fact]
    public async Task Add_Update_Get_ShouldPersistChanges()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        _ctx.Organizations.Add(org); await _ctx.SaveChangesAsync();

        var rep = new Representative(org.Id, "Ana", "C1", "PT", "a@x.com", "+3519");
        await _repo.AddAsync(rep);

        rep.Update("Ana Maria", "C2", "ES", "am@x.com", "+3490");
        await _repo.UpdateAsync(rep);

        var loaded = await _repo.GetByIdAsync(rep.Id);
        loaded.Should().NotBeNull();
        loaded!.Name.Should().Be("Ana Maria");
        loaded.Nationality.Should().Be("ES");
    }

    [Fact]
    public async Task ListByOrganizationAsync_ShouldHonorActiveFilter()
    {
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        _ctx.Organizations.Add(org); await _ctx.SaveChangesAsync();

        var a = new Representative(org.Id, "A", "C1", "PT", "a@x.com", "+3519");
        var b = new Representative(org.Id, "B", "C2", "PT", "b@x.com", "+3519");
        b.SetActive(false);

        await _repo.AddAsync(a); await _repo.AddAsync(b);

        var actives = await _repo.ListByOrganizationAsync(org.Id, true);
        actives.Should().OnlyContain(r => r.IsActive);

        var inactives = await _repo.ListByOrganizationAsync(org.Id, false);
        inactives.Should().OnlyContain(r => !r.IsActive);

        var all = await _repo.ListByOrganizationAsync(org.Id, null);
        all.Count().Should().Be(2);
    }
}
