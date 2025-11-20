using System;
using FluentAssertions;
using WebApp.Models.Domain.Agents;
using Xunit;

namespace WebApp.Tests.Domain
{
    public class ShippingAgentOrganizationTests
{
    private ShippingAgentOrganization CreateOrg()
        => new ShippingAgentOrganization(
            "ORG1", "LegalName", "Alt", "Some Address", "123456");

    [Fact]
    public void Constructor_ShouldInitialize_WhenValid()
    {
        var org = CreateOrg();
        org.Identifier.Should().Be("ORG1");
        org.LegalName.Should().Be("LegalName");
        org.Address.Should().Be("Some Address");
        org.TaxNumber.Should().Be("123456");
        org.IsActive.Should().BeTrue();
        org.Representatives.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenIdentifierInvalid()
    {
        Action act = () =>
            new ShippingAgentOrganization("", "Legal", null, "Addr", "123");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void UpdateProfile_ShouldModifyFields()
    {
        var org = CreateOrg();
        org.UpdateProfile("Updated Alt", "Updated Address");
        org.AlternativeNames.Should().Be("Updated Alt");
        org.Address.Should().Be("Updated Address");
    }

    [Fact]
    public void Activate_Deactivate_ShouldToggle()
    {
        var org = CreateOrg();
        org.Deactivate();
        org.IsActive.Should().BeFalse();
        org.Activate();
        org.IsActive.Should().BeTrue();
    }

    [Fact]
    public void AddRepresentative_ShouldAdd_WhenValid()
    {
        var org = CreateOrg();
        var rep = new Representative(org.Id, "Bob", "CID123", "PRT", "bob@mail.com", "+351911111111");
        org.AddRepresentative(rep);
        org.Representatives.Should().Contain(rep);
    }

    [Fact]
    public void AddRepresentative_ShouldThrow_WhenEmailDuplicated()
    {
        var org = CreateOrg();
        var rep1 = new Representative(org.Id, "Bob", "CID123", "PRT", "mail@test.com", "+351911111111");
        var rep2 = new Representative(org.Id, "Carl", "CID456", "PRT", "mail@test.com", "+351922222222");

        org.AddRepresentative(rep1);
        Action act = () => org.AddRepresentative(rep2);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void EnsureHasAtLeastOneRepresentative_ShouldThrow_WhenNone()
    {
        var org = CreateOrg();
        Action act = () => org.EnsureHasAtLeastOneRepresentative();
        act.Should().Throw<InvalidOperationException>();
    }
/*
    [Fact]
    public void RemoveRepresentative_ShouldRemove_WhenValid()
    {
        var org = CreateOrg();
        var rep = new Representative(org.Id, "Bob", "CID123", "PRT", "bob@mail.com", "+351911111111");
        org.AddRepresentative(rep);

        org.RemoveRepresentative(rep.Id);
        org.Representatives.Should().BeEmpty();
    }*/
}
}
