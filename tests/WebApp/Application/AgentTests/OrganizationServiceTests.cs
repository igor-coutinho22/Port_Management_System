using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Agents
{
    public class OrganizationServiceTests
    {
        private readonly StubOrganizationRepository _orgRepository;
        private readonly OrganizationService _service;

        public OrganizationServiceTests()
        {
            _orgRepository = new StubOrganizationRepository();
            _service = new OrganizationService(_orgRepository);
        }

        private static ShippingAgentOrganization CreateTestOrg(string identifier = "ORG001", string legalName = "Alpha Org", string taxNumber = "PT123456789")
        {
            var org = new ShippingAgentOrganization(identifier, legalName, "AltName", "Rua A, 1", taxNumber);
            var rep = new Representative(org.Id, "John Doe", "CIT123", "PRT", "john@alpha.com", "+351911111111");
            org.AddRepresentative(rep);
            return org;
        }

        [Fact]
        public async Task CreateAsync_ShouldCreate_WhenValidOrg()
        {
            var org = CreateTestOrg();
            await _service.CreateAsync(org);
            var created = await _orgRepository.GetByIdAsync(org.Id);
            created.Should().NotBeNull();
            created!.LegalName.Should().Be(org.LegalName);
            created.TaxNumber.Should().Be(org.TaxNumber);
            created.Representatives.Should().HaveCount(1);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenOrgIsNull()
        {
            var act = async () => await _service.CreateAsync(null!);
            await act.Should().ThrowAsync<ArgumentNullException>();
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenNoRepresentatives()
        {
            var org = new ShippingAgentOrganization("ORG002", "NoReps Org", "AltName", "Rua B, 2", "PT000111222");
            var act = async () => await _service.CreateAsync(org);
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*At least one representative*");
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDuplicateTaxNumber()
        {
            var org1 = CreateTestOrg("ORG001", "Alpha Org", "PTDUP001");
            var org2 = CreateTestOrg("ORG002", "Beta Org", "PTDUP001");
            await _service.CreateAsync(org1);
            await _orgRepository.AddAsync(org1); // Direct add to simulate duplicate
            var act = async () => await _service.CreateAsync(org2);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Tax number already exists*");
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturn_WhenExists()
        {
            var org = CreateTestOrg();
            await _orgRepository.AddAsync(org);
            var result = await _service.GetByIdAsync(org.Id);
            result.Should().NotBeNull();
            result!.Id.Should().Be(org.Id);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
        {
            var result = await _service.GetByIdAsync(Guid.NewGuid());
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAll_Organizations()
        {
            var org1 = CreateTestOrg("ORG001", "Alpha Org", "PT100");
            var org2 = CreateTestOrg("ORG002", "Beta Org", "PT200");
            await _orgRepository.AddAsync(org1);
            await _orgRepository.AddAsync(org2);
            var result = await _service.GetAllAsync();
            result.Should().HaveCount(2);
            result.Should().Contain(o => o.LegalName == "Alpha Org");
            result.Should().Contain(o => o.LegalName == "Beta Org");
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnEmpty_WhenNoOrganizations()
        {
            var result = await _service.GetAllAsync();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchAsync_ShouldReturn_ByNameAndTax()
        {
            var org1 = CreateTestOrg("ORG001", "PortAlpha", "PT100");
            var org2 = CreateTestOrg("ORG002", "PortBeta", "PT200");
            await _orgRepository.AddAsync(org1);
            await _orgRepository.AddAsync(org2);
            var listByName = await _service.SearchAsync("Alpha", null);
            listByName.Should().HaveCount(1).And.OnlyContain(o => o.LegalName != null && o.LegalName.Contains("Alpha"));
            var listByTax = await _service.SearchAsync(null, "PT200");
            listByTax.Should().HaveCount(1).And.OnlyContain(o => o.TaxNumber == "PT200");
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdate_WhenExists()
        {
            var org = CreateTestOrg();
            await _orgRepository.AddAsync(org);
            var updatedOrg = new ShippingAgentOrganization(org.Identifier, "Updated Org", "UpdatedAlt", "New Address", org.TaxNumber);
            foreach (var rep in org.Representatives)
                updatedOrg.AddRepresentative(rep);
            await _service.UpdateAsync(org.Id, updatedOrg);
            var result = await _orgRepository.GetByIdAsync(org.Id);
            result!.LegalName.Should().Be("Updated Org");
            result.Address.Should().Be("New Address");
            result.AlternativeNames.Should().Be("UpdatedAlt");
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenNotFound()
        {
            var org = CreateTestOrg();
            var act = async () => await _service.UpdateAsync(Guid.NewGuid(), org);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Organization not found*");
        }

        [Fact]
        public async Task ActivateAsync_ShouldSetActive()
        {
            var org = CreateTestOrg();
            await _orgRepository.AddAsync(org);
            await _service.DeactivateAsync(org.Id);
            var deactivated = await _orgRepository.GetByIdAsync(org.Id);
            deactivated!.IsActive.Should().BeFalse();
            await _service.ActivateAsync(org.Id);
            var activated = await _orgRepository.GetByIdAsync(org.Id);
            activated!.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task ActivateAsync_ShouldThrow_WhenNotFound()
        {
            var act = async () => await _service.ActivateAsync(Guid.NewGuid());
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*Organization not found*");
        }

        [Fact]
        public async Task DeleteAsync_ShouldDelete_WhenExists()
        {
            var org = CreateTestOrg();
            await _orgRepository.AddAsync(org);
            await _service.DeleteAsync(org.Id);
            var result = await _orgRepository.GetByIdAsync(org.Id);
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenNotExists()
        {
            var act = async () => await _service.DeleteAsync(Guid.NewGuid());
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*Organization not found*");
        }

        // Nested Stub Repository for testing
        private class StubOrganizationRepository : IOrganizationRepository
        {
            private readonly List<ShippingAgentOrganization> _orgs = new();

            public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id)
                => Task.FromResult(_orgs.FirstOrDefault(o => o.Id == id));

            public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber)
                => Task.FromResult(_orgs.FirstOrDefault(o => o.TaxNumber == taxNumber));

            public Task AddAsync(ShippingAgentOrganization org)
            {
                if (_orgs.Any(o => o.TaxNumber == org.TaxNumber))
                    throw new ArgumentException("Tax number already exists");
                _orgs.Add(org);
                return Task.CompletedTask;
            }

            public Task UpdateAsync(ShippingAgentOrganization org)
            {
                var idx = _orgs.FindIndex(o => o.Id == org.Id);
                if (idx >= 0) _orgs[idx] = org;
                return Task.CompletedTask;
            }

            public Task DeleteAsync(ShippingAgentOrganization org)
            {
                _orgs.RemoveAll(o => o.Id == org.Id);
                return Task.CompletedTask;
            }

            public Task<List<ShippingAgentOrganization>> GetAllAsync()
                => Task.FromResult(_orgs.ToList());

            public Task<List<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber)
            {
                var query = _orgs.AsQueryable();
                if (!string.IsNullOrWhiteSpace(name))
                    query = query.Where(o => o.LegalName.Contains(name, StringComparison.OrdinalIgnoreCase));
                if (!string.IsNullOrWhiteSpace(taxNumber))
                    query = query.Where(o => o.TaxNumber == taxNumber);
                return Task.FromResult(query.ToList());
            }
        }
    }
}
