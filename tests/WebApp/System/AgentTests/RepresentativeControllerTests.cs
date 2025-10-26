using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Controllers;
using WebApp.Models.Application.Services;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Agents
{
    public class RepresentativeControllerTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase($"RepCtl_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static RepresentativesController NewController(PortManagementContext ctx)
        {
            var svc = new RepresentativeService(
                new OrganizationRepository(ctx),
                new RepresentativeRepository(ctx));
            return new RepresentativesController(svc);
        }

        private static (ShippingAgentOrganization org, Representative rep) Seed(PortManagementContext ctx)
        {
            var org = new ShippingAgentOrganization("Omega SA","Omega","Addr","PT-OMEGA");
            var rep = new Representative(org.Id,"Paula","CIDO","PRT","paula@omega.com","+351912345678");
            org.AddRepresentative(rep);
            ctx.Organizations.Add(org);
            ctx.Representatives.Add(rep);
            ctx.SaveChanges();
            return (org, rep);
        }

        [Fact]
        public async Task ListAll_ReturnsOk_WithItems()
        {
            using var ctx = NewContext();
            var (org, _) = Seed(ctx);
            var ctrl = NewController(ctx);

            var res = await ctrl.ListAll(orgId: org.Id, active: null);
            var ok = res.Result as OkObjectResult;
            ok.Should().NotBeNull();
        }
    }
}
