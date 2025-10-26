using FluentAssertions;
using System;
using WebApp.Models.Domain.Agents;

public class OrganizationAndRepresentativeDomainTests
{
    [Fact]
    public void Organization_AddRepresentative_ShouldLinkRepresentative()
    {
        var org = new ShippingAgentOrganization("SEA & CO", null, "Rua A, Porto", "PT999999990");
        var rep = new Representative(org.Id, "Ana Silva", "CIT123", "PT", "ana@sea.co", "+351911111111");

        org.AddRepresentative(rep);

        org.Representatives.Should().ContainSingle();
        org.Representatives.Should().Contain(r => r.Email == "ana@sea.co" && r.OrganizationId == org.Id);
    }

    [Fact]
    public void Representative_Update_ShouldChangeAllEditableFields()
    {
        var orgId = Guid.NewGuid();
        var rep = new Representative(orgId, "Ana", "C1", "PT", "a@x.com", "+351900000001");

        rep.Update("Ana Maria", "C2", "ES", "ana.maria@x.com", "+34900000001");

        rep.Name.Should().Be("Ana Maria");
        rep.CitizenId.Should().Be("C2");
        rep.Nationality.Should().Be("ES");
        rep.Email.Should().Be("ana.maria@x.com");
        rep.Phone.Should().Be("+34900000001");
    }

    [Fact]
    public void Representative_SetActive_TogglesStatus()
    {
        var rep = new Representative(Guid.NewGuid(), "Ana", "C1", "PT", "a@x.com", "+351900000001");

        rep.SetActive(false);
        rep.IsActive.Should().BeFalse();

        rep.SetActive(true);
        rep.IsActive.Should().BeTrue();
    }
}
