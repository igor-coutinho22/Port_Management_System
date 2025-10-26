using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Controllers;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Agents
{
    public class OrganizationControllerTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase($"OrgCtl_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static OrganizationsController NewController(PortManagementContext ctx)
        {
            var svc = new OrganizationService(new OrganizationRepository(ctx));
            return new OrganizationsController(svc);
        }

        private static ShippingAgentOrganization SeedOrg(PortManagementContext ctx)
        {
            var org = new ShippingAgentOrganization("Zeta SA", "Zeta", "Z addr", "PT-ZETA");
            var rep = new Representative(org.Id, "Mario", "CIDZ", "PRT", "m@zeta.com", "+351911000000");
            org.AddRepresentative(rep);
            ctx.Organizations.Add(org);
            ctx.Representatives.Add(rep);
            ctx.SaveChanges();
            return org;
        }

        [Fact]
        public async Task List_ReturnsOk_WithItems()
        {
            using var ctx = NewContext();
            SeedOrg(ctx);
            var ctrl = NewController(ctx);

            var result = await ctrl.List(name: "Zeta", taxNumber: null);
            var ok = result.Result as OkObjectResult;
            ok.Should().NotBeNull();
            var list = ok!.Value as System.Collections.Generic.IEnumerable<OrganizationDto>;
            list!.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Update_ReturnsOk_WithUpdatedDto()
        {
            using var ctx = NewContext();
            var org = SeedOrg(ctx);
            var ctrl = NewController(ctx);

            var res = await ctrl.Update(org.Id, new UpdateOrganizationRequest("Zeta Updated","Z","New street 1","PT-ZETA"));
            var ok = res.Result as OkObjectResult;
            ok.Should().NotBeNull();
            var dto = (OrganizationDto) ok!.Value!;
            dto.LegalName.Should().Be("Zeta Updated");
        }
    }
}
