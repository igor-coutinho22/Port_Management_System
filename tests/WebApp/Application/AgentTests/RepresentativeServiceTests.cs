using FluentAssertions;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Services.StaffService;
using WebApp.Models.Domain;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;


namespace WebApp.Tests.Agents
{
    public class RepresentativeServiceTests
{
    private readonly Mock<IOrganizationRepository> _orgRepo = new();
    private readonly Mock<IRepresentativeRepository> _repRepo = new();
    private readonly RepresentativeService _service;

    public RepresentativeServiceTests()
    {
        _service = new RepresentativeService(_orgRepo.Object, _repRepo.Object);
    }

    private ShippingAgentOrganization CreateOrg()
        => new ShippingAgentOrganization("ORG", "Legal", null, "Addr", "123");

    [Fact]
    public async Task CreateAsync_ShouldAddRepresentative()
    {
        var org = CreateOrg();
        _orgRepo.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        var rep = new Representative(org.Id, "Bob", "CID123", "PRT", "b@mail.com", "+351911111111");

        await _service.CreateAsync(org.Id, rep);

        _repRepo.Verify(r => r.AddAsync(rep), Times.Once);
        _orgRepo.Verify(r => r.UpdateAsync(org), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyRepresentative()
    {
        var rep = new Representative(Guid.NewGuid(), "Bob", "CID123", "PRT", "b@mail.com", "+351911111111");
        _repRepo.Setup(r => r.GetByIdAsync(rep.Id)).ReturnsAsync(rep);

        var updated = new Representative(rep.OrganizationId, "Bob", "CID123", "PRT", "new@mail.com", "+351922222222");

        await _service.UpdateAsync(rep.Id, updated);

        rep.Email.Should().Be("new@mail.com");
        _repRepo.Verify(r => r.UpdateAsync(rep), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveRep()
    {
        var org = CreateOrg();
        var rep = new Representative(org.Id, "Bob", "CID123", "PRT", "b@mail.com", "+351911111111");

        org.AddRepresentative(rep);

        _repRepo.Setup(r => r.GetByIdAsync(rep.Id)).ReturnsAsync(rep);
        _orgRepo.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        await _service.DeleteAsync(rep.Id);

        _orgRepo.Verify(r => r.UpdateAsync(org), Times.Once);
        _repRepo.Verify(r => r.DeleteAsync(rep), Times.Once);
    }
}
}
