/*using FluentAssertions;
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
    public class OrganizationServiceTests
{
    private readonly Mock<IOrganizationRepository> _repoMock = new();
    private readonly OrganizationService _service;

    public OrganizationServiceTests()
    {
        _service = new OrganizationService(_repoMock.Object);
    }

    private ShippingAgentOrganization CreateOrg()
        => new ShippingAgentOrganization("ORG1", "Legal", "Alt", "Addr", "123456");

    [Fact]
    public async Task CreateAsync_ShouldAdd()
    {
        var org = CreateOrg();
        org.AddRepresentative(new Representative(org.Id, "A", "CID1", "PRT", "a@mail.com", "+351911111111"));

        await _service.CreateAsync(org);

        _repoMock.Verify(r => r.AddAsync(org), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyAndSave()
    {
        var existing = CreateOrg();
        var updated = CreateOrg();
        updated.UpdateProfile("UPDATED", "UPDATED");

        _repoMock.Setup(r => r.GetByIdAsync(existing.Id)).ReturnsAsync(existing);

        await _service.UpdateAsync(existing.Id, updated);

        existing.AlternativeNames.Should().Be("UPDATED");
        _repoMock.Verify(r => r.UpdateAsync(existing), Times.Once);
    }

    [Fact]
    public async Task ActivateAsync_ShouldToggle()
    {
        var org = CreateOrg();
        org.Deactivate();

        _repoMock.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        await _service.ActivateAsync(org.Id);

        org.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task DeactivateAsync_ShouldToggle()
    {
        var org = CreateOrg();

        _repoMock.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        await _service.DeactivateAsync(org.Id);

        org.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemove()
    {
        var org = CreateOrg();

        _repoMock.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        await _service.DeleteAsync(org.Id);

        _repoMock.Verify(r => r.DeleteAsync(org), Times.Once);
    }
}
}
*/