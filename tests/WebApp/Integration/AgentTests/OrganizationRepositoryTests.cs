using System;
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
    public class OrganizationRepositoryTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase($"OrgRepo_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static ShippingAgentOrganization NewOrg(string name, string tax, string alt = "ALT", string addr = "Addr")
            => new(name, alt, addr, tax);

        private static void Seed(PortManagementContext ctx)
        {
            // 3 organizações para exercitar filtros e ordenação
            var a = NewOrg("Alpha Lines", "PT-100", "Alpha", "A street");
            var b = NewOrg("Beta Logistics", "PT-200", "Beta", "B street");
            var c = NewOrg("Gamma Shipping", "PT-300", "Gamma", "C street");

            // pelo menos 1 representante em cada (respeitando as tuas regras)
            var r1 = new Representative(a.Id, "Ana", "CIDA", "PRT", "ana@alpha.com", "+351911111111");
            var r2 = new Representative(b.Id, "Bruno", "CIDB", "PRT", "bruno@beta.com", "+351922222222");
            var r3 = new Representative(c.Id, "Carla", "CIDC", "PRT", "carla@gamma.com", "+351933333333");
            a.AddRepresentative(r1);
            b.AddRepresentative(r2);
            c.AddRepresentative(r3);

            ctx.Organizations.AddRange(a, b, c);
            ctx.Representatives.AddRange(r1, r2, r3);
            ctx.SaveChanges();
        }

        [Fact]
        public async Task AddAsync_PersistsEntity_WithRepresentatives()
        {
            using var ctx = NewContext();
            var repo = new OrganizationRepository(ctx);

            var org = NewOrg("Delta Ports", "PT-400", "Delta", "D street");
            var rep = new Representative(org.Id, "Diana", "CIDD", "PRT", "diana@delta.com", "+351944444444");
            org.AddRepresentative(rep);

            await repo.AddAsync(org);

            var fromDb = await ctx.Organizations.Include(o => o.Representatives).FirstOrDefaultAsync(o => o.Id == org.Id);
            fromDb.Should().NotBeNull();
            fromDb!.LegalName.Should().Be("Delta Ports");
            fromDb.Representatives.Should().HaveCount(1);
            fromDb.Representatives.First().Email.Should().Be("diana@delta.com");
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsOrganization_WhenExists()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var anyId = ctx.Organizations.Select(o => o.Id).First();
            var fromDb = await repo.GetByIdAsync(anyId);

            fromDb.Should().NotBeNull();
            fromDb!.Id.Should().Be(anyId);
        }

        [Fact]
        public async Task GetByTaxNumberAsync_ReturnsOrganization_WhenTaxExists()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var fromDb = await repo.GetByTaxNumberAsync("PT-200");

            fromDb.Should().NotBeNull();
            fromDb!.LegalName.Should().Be("Beta Logistics");
        }

        [Fact]
        public async Task ListAsync_NoFilters_ReturnsAll_OrderedByLegalName()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var list = (await repo.ListAsync(name: null, taxNumber: null)).ToList();

            list.Should().HaveCount(3);
            list.Select(o => o.LegalName).Should().BeInAscendingOrder(); // o repo faz OrderBy(LegalName)
        }

        [Fact]
        public async Task ListAsync_ByName_FiltersByLegalOrAlternativeNames()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var byLegal = await repo.ListAsync("Gamma", null);
            byLegal.Should().HaveCount(1).And.OnlyContain(o => o.LegalName.Contains("Gamma"));

            var byAlt = await repo.ListAsync("Beta", null);
            byAlt.Should().HaveCount(1).And.OnlyContain(o => o.AlternativeNames!.Contains("Beta"));
        }

        [Fact]
        public async Task ListAsync_ByTaxNumber_FiltersCorrectly()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var list = await repo.ListAsync(null, "PT-1"); // partial match
            list.Should().OnlyContain(o => o.TaxNumber.Contains("PT-1"));
        }

        [Fact]
        public async Task UpdateAsync_PersistsChanges()
        {
            using var ctx = NewContext();
            Seed(ctx);
            var repo = new OrganizationRepository(ctx);

            var org = await ctx.Organizations.FirstAsync(o => o.TaxNumber == "PT-300");
            org.UpdateProfile("Gamma Updated", "G", "New C street", "PT-300");

            await repo.UpdateAsync(org);

            var reloaded = await ctx.Organizations.FindAsync(org.Id);
            reloaded!.LegalName.Should().Be("Gamma Updated");
            reloaded.Address.Should().Be("New C street");
        }
    }
}
