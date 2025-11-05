using System;
using System.Collections.Generic;
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

namespace WebApp.Tests.Agents
{
    public class OrganizationServiceTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase(databaseName: $"OrgSvc_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static OrganizationRepository NewOrgRepo(PortManagementContext ctx) => new(ctx);
        private static RepresentativeRepository NewRepRepo(PortManagementContext ctx) => new(ctx);

        private static IOrganizationService NewService(PortManagementContext ctx)
        {
            var orgRepo = NewOrgRepo(ctx);
            return new OrganizationService(orgRepo);
        }

        private static ShippingAgentOrganization SeedOrg(PortManagementContext ctx, string tax = "PT123456789", string name = "Alpha SA")
        {
            var alternativeNames = name.Replace("Port", "").Replace("SA", "Inc"); // Generate unique alternative names
            var org = new ShippingAgentOrganization(name, alternativeNames, "Rua A, 1", tax);
            var rep = new Representative(org.Id, "John Doe", "CIT123", "PRT", "john@alpha.com", "+351911111111");
            org.AddRepresentative(rep);
            ctx.Organizations.Add(org);
            ctx.Representatives.Add(rep);
            ctx.SaveChanges();
            return org;
        }

        [Fact]
        public async Task CreateAsync_WithOneRepresentative_Succeeds()
        {
            using var ctx = NewContext();
            var svc = NewService(ctx);

            var req = new CreateOrganizationRequest(
                LegalName: "TransPorts SA",
                AlternativeNames: "TransPorts",
                Address: "Av. Porto, 10",
                TaxNumber: "PT999000111",
                Representatives: new[]
                {
                    new CreateRepresentativeRequest("Ana Silva","CID1","PRT","ana@tp.com","+351912345678")
                });

            var dto = await svc.CreateAsync(req);

            dto.Should().NotBeNull();
            dto.LegalName.Should().Be("TransPorts SA");
            var stored = await ctx.Organizations.Include(o => o.Representatives)
                .FirstAsync(o => o.Id == dto.Id);
            stored.Representatives.Should().HaveCount(1);
        }

        [Fact]
        public async Task CreateAsync_WithoutRepresentatives_Throws()
        {
            using var ctx = NewContext();
            var svc = NewService(ctx);

            var req = new CreateOrganizationRequest(
                "NoReps SA", "", "Addr", "PT000111222",
                Representatives: Array.Empty<CreateRepresentativeRequest>());

            await FluentActions.Invoking(() => svc.CreateAsync(req))
                .Should().ThrowAsync<ArgumentException>()
                .WithMessage("*At least one representative*");
        }

        [Fact]
        public async Task CreateAsync_WithDuplicateTaxNumber_Throws()
        {
            using var ctx = NewContext();
            SeedOrg(ctx, tax:"PTDUP001", name:"Exists SA");
            var svc = NewService(ctx);

            var req = new CreateOrganizationRequest(
                "Other SA", "", "Addr", "PTDUP001",
                new []{ new CreateRepresentativeRequest("Mary","X1","PRT","m@o.com","+351912000000") });

            await FluentActions.Invoking(() => svc.CreateAsync(req))
                .Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Tax number already exists*");
        }

        [Fact]
        public async Task ListAsync_ByNameAndTax_FiltersCorrectly()
        {
            using var ctx = NewContext();
            SeedOrg(ctx, tax: "PT100", name: "PortAlpha");
            SeedOrg(ctx, tax: "PT200", name: "PortBeta");
            var svc = NewService(ctx);

            var listByName = await svc.ListAsync("Alpha", null);
            listByName.Should().HaveCount(1).And.OnlyContain(o => o.LegalName.Contains("Alpha"));

            var listByTax = await svc.ListAsync(null, "PT200");
            listByTax.Should().HaveCount(1).And.OnlyContain(o => o.TaxNumber == "PT200");
        }

        [Fact]
        public async Task UpdateAsync_ChangeFields_Succeeds()
        {
            using var ctx = NewContext();
            var org = SeedOrg(ctx, tax: "PT300", name:"Org300");
            var svc = NewService(ctx);

            var updated = await svc.UpdateAsync(org.Id,
                new UpdateOrganizationRequest("Org300 Updated","O300","New Address","PT300"));

            updated.LegalName.Should().Be("Org300 Updated");
            updated.Address.Should().Be("New Address");
            var reloaded = await ctx.Organizations.FindAsync(org.Id);
            reloaded!.LegalName.Should().Be("Org300 Updated");
        }

        [Fact]
        public async Task UpdateAsync_ChangeTaxToExisting_Throws()
        {
            using var ctx = NewContext();
            var a = SeedOrg(ctx, tax: "PT400", name:"A");
            var b = SeedOrg(ctx, tax: "PT500", name:"B");
            var svc = NewService(ctx);

            await FluentActions.Invoking(() => svc.UpdateAsync(a.Id,
                new UpdateOrganizationRequest("A","A","Addr","PT500")))
                .Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Tax number already exists*");
        }
    }
}
