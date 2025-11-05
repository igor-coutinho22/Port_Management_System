using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Repositories.Agents
{
    public class RepresentativeRepositoryTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase($"RepRepo_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static (ShippingAgentOrganization org, Representative rep1, Representative rep2) Seed(PortManagementContext ctx)
        {
            var org = new ShippingAgentOrganization("Org SA", "Org", "Addr", "PT-REPO");
            var rep1 = new Representative(org.Id, "Alice", "CIDA123", "PRT", "alice@org.com", "+351911111111");
            var rep2 = new Representative(org.Id, "Bob", "CIDB456", "PRT", "bob@org.com", "+351922222222");
            rep2.SetActive(false);

            org.AddRepresentative(rep1);
            org.AddRepresentative(rep2);

            ctx.Organizations.Add(org);
            ctx.Representatives.AddRange(rep1, rep2);
            ctx.SaveChanges();

            return (org, rep1, rep2);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsEntity_WhenExists()
        {
            using var ctx = NewContext();
            var (_, rep1, _) = Seed(ctx);
            var repo = new RepresentativeRepository(ctx);

            var fromDb = await repo.GetByIdAsync(rep1.Id);

            fromDb.Should().NotBeNull();
            fromDb!.Email.Should().Be("alice@org.com");
        }

        [Fact]
        public async Task ListByOrganizationAsync_FiltersByActive()
        {
            using var ctx = NewContext();
            var (org, _, _) = Seed(ctx);
            var repo = new RepresentativeRepository(ctx);

            var actives = await repo.ListByOrganizationAsync(org.Id, active: true);
            actives.Should().OnlyContain(r => r.OrganizationId == org.Id && r.IsActive);

            var inactives = await repo.ListByOrganizationAsync(org.Id, active: false);
            inactives.Should().OnlyContain(r => r.OrganizationId == org.Id && !r.IsActive);
        }

        [Fact]
        public async Task ListAllAsync_FiltersByOrgAndActive()
        {
            using var ctx = NewContext();
            var (org, _, _) = Seed(ctx);

            // outra org para validar filtro
            var other = new ShippingAgentOrganization("Other", null, "Addr", "PT-OTHER");
            var otherRep = new Representative(other.Id, "Carol", "CIDC789", "PRT", "carol@other.com", "+351933333333");
            other.AddRepresentative(otherRep);
            ctx.Organizations.Add(other);
            ctx.Representatives.Add(otherRep);
            await ctx.SaveChangesAsync();

            var repo = new RepresentativeRepository(ctx);

            var onlyOrg = await repo.ListAllAsync(org.Id, null);
            onlyOrg.Should().OnlyContain(r => r.OrganizationId == org.Id);

            var onlyActive = await repo.ListAllAsync(org.Id, true);
            onlyActive.Should().OnlyContain(r => r.OrganizationId == org.Id && r.IsActive);
        }

        [Fact]
        public async Task AddAsync_PersistsEntity()
        {
            using var ctx = NewContext();
            var org = new ShippingAgentOrganization("NewOrg", null, "Addr", "PT-ADD");
            ctx.Organizations.Add(org);
            await ctx.SaveChangesAsync();

            var repo = new RepresentativeRepository(ctx);
            var rep = new Representative(org.Id, "New Rep", "CIDN999", "PRT", "new@org.com", "+351944444444");

            await repo.AddAsync(rep);

            (await ctx.Representatives.FindAsync(rep.Id)).Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateAsync_PersistsChanges()
        {
            using var ctx = NewContext();
            var (_, rep1, _) = Seed(ctx);
            var repo = new RepresentativeRepository(ctx);

            rep1.SetActive(false);
            rep1.UpdateProfile("Alice Updated", "CIDA123", "PRT", "alice@org.com", "+351955555555");

            await repo.UpdateAsync(rep1);

            var fromDb = await ctx.Representatives.FindAsync(rep1.Id);
            fromDb!.IsActive.Should().BeFalse();
            fromDb.Phone.Should().Be("+351955555555");
            fromDb.Name.Should().Be("Alice Updated");
        }
    }
}
