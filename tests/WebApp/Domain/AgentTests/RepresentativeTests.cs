using System;
using System.Collections.Generic;
using FluentAssertions;
using WebApp.Models.Domain.Agents;
using Xunit;

namespace WebApp.Tests.Domain
{
    public class RepresentativeTests
{
    
    private Guid OrgId => Guid.NewGuid();

    [Fact]
    public void Constructor_ShouldInitialize_WhenValid()
    {
        var rep = new Representative(OrgId, "Alice", "CID123", "PRT", "a@mail.com", "+351911111111");
        rep.Name.Should().Be("Alice");
        rep.Email.Should().Be("a@mail.com");
        rep.Nationality.Should().Be("PRT");
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenNameInvalid()
    {
        Action act = () => new Representative(OrgId, "", "CID123", "PRT", "a@mail.com", "+351911111111");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void UpdateProfile_ShouldModify()
    {
        var rep = new Representative(OrgId, "Alice", "CID123", "PRT", "a@mail.com", "+351911111111");
        rep.UpdateProfile("BRA", "new@mail.com", "+351922222222");
        rep.Nationality.Should().Be("BRA");
        rep.Email.Should().Be("new@mail.com");
        rep.Phone.Should().Be("+351922222222");
    }

    [Fact]
    public void Activate_Deactivate_ShouldToggle()
    {
        var rep = new Representative(OrgId, "Alice", "CID123", "PRT", "a@mail.com", "+351911111111");
        rep.Deactivate();
        rep.IsActive.Should().BeFalse();
        rep.Activate();
        rep.IsActive.Should().BeTrue();
    }
}

}
