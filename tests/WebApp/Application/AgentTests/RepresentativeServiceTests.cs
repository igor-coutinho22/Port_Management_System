using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;
using System.Collections.Generic;


namespace WebApp.Tests.Agents
{
    public class RepresentativeServiceTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase(databaseName: $"RepSvc_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static (ShippingAgentOrganization org, Representative rep) SeedOrgWithRep(PortManagementContext ctx)
        {
            var org = new ShippingAgentOrganization("Seed SA", "Seed", "Addr", "PT-SEED-1");
            var rep = new Representative(org.Id, "John", "CIT1", "PRT", "john@seed.com", "+351911111111");
            org.AddRepresentative(rep);
            ctx.Organizations.Add(org);
            ctx.Representatives.Add(rep);
            ctx.SaveChanges();
            return (org, rep);
        }

        private static RepresentativeService NewService(PortManagementContext ctx)
        {
            var orgRepo = new OrganizationRepository(ctx);
            var repRepo = new RepresentativeRepository(ctx);
            return new RepresentativeService(orgRepo, repRepo);
        }

        [Fact]
        public async Task CreateAsync_WithUnknownOrganization_Throws()
        {
            using var ctx = NewContext();
            var svc = NewService(ctx);

            await FluentActions.Invoking(() =>
                svc.CreateAsync(Guid.NewGuid(),
                    new CreateRepresentativeRequest("Ana", "CID1", "PRT", "a@a.com", "+351912000000")))
                .Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*Organization not found*");
        }

        [Fact]
        public async Task CreateAsync_Succeeds_AndIsQueryable()
        {
            using var ctx = NewContext();
            var (org, _) = SeedOrgWithRep(ctx);
            var svc = NewService(ctx);

            var created = await svc.CreateAsync(org.Id,
                new CreateRepresentativeRequest("Mary", "CID2", "PRT", "mary@seed.com", "+351912222222"));

            created.OrganizationId.Should().Be(org.Id);
            var all = await svc.ListAllAsync(org.Id, active: null);
            all.Should().Contain(x => x.Email == "mary@seed.com");
        }

        [Fact]
        public async Task UpdateAsync_ChangesFields()
        {
            using var ctx = NewContext();
            var (org, rep) = SeedOrgWithRep(ctx);
            var svc = NewService(ctx);

            var updated = await svc.UpdateAsync(rep.Id,
                new UpdateRepresentativeRequest("John Updated", "CIT1", "PRT", "john@seed.com", "+351933333333"));

            updated.Phone.Should().Be("+351933333333");
            var dbRep = await ctx.Representatives.FindAsync(rep.Id);
            dbRep!.Phone.Should().Be("+351933333333");
        }

        [Fact]
        public async Task SetActiveAsync_TogglesStatus()
        {
            using var ctx = NewContext();
            var (_, rep) = SeedOrgWithRep(ctx);
            var svc = NewService(ctx);

            await svc.SetActiveAsync(rep.Id, false);
            var dbRep = await ctx.Representatives.FindAsync(rep.Id);
            dbRep!.IsActive.Should().BeFalse();

            await svc.SetActiveAsync(rep.Id, true);
            (await ctx.Representatives.FindAsync(rep.Id))!.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task ListAllAsync_ByOrgAndActive_FiltersCorrectly()
        {
            using var ctx = NewContext();
            var (org, rep1) = SeedOrgWithRep(ctx);
            var svc = NewService(ctx);

            // outro rep inativo
            var rep2 = new Representative(org.Id, "Ana", "CIT2", "PRT", "ana@seed.com", "+351912222222");
            rep2.SetActive(false);
            ctx.Representatives.Add(rep2);
            await ctx.SaveChangesAsync();

            var active = await svc.ListAllAsync(org.Id, true);
            active.Should().OnlyContain(r => r.IsActive);

            var all = await svc.ListAllAsync(org.Id, null);
            all.Should().HaveCount(2);
        }
    }
}
