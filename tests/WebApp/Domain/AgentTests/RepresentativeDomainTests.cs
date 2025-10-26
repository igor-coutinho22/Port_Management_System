using System;
using System.Collections.Generic;
using FluentAssertions;
using WebApp.Models.Domain.Agents;
using Xunit;

namespace WebApp.Tests.Domain
{
    public class RepresentativeDomainTests
    {
        [Fact]
        public void Ctor_ValidData_SetsProperties_AndActiveTrue()
        {
            var orgId = Guid.NewGuid();

            var rep = new Representative(orgId, "John Doe", "CIT123", "PRT", "john@org.com", "+351911111111");

            rep.OrganizationId.Should().Be(orgId);
            rep.Name.Should().Be("John Doe");
            rep.CitizenId.Should().Be("CIT123");
            rep.Nationality.Should().Be("PRT");
            rep.Email.Should().Be("john@org.com");
            rep.Phone.Should().Be("+351911111111");
            rep.IsActive.Should().BeTrue();
        }

        [Fact]
        public void Ctor_EmptyOrganizationId_Throws()
        {
            Action act = () => new Representative(Guid.Empty, "John", "CIT", "PRT", "j@o.com", "+351911111111");
            act.Should().Throw<ArgumentException>().WithMessage("*OrganizationId*");
        }

        [Theory]
        [InlineData("", "CIT", "PRT", "j@o.com", "+351911111111", "*Name is required*")]
        [InlineData("John", "", "PRT", "j@o.com", "+351911111111", "*CitizenId is required*")]
        [InlineData("John", "CIT", "", "j@o.com", "+351911111111", "*Nationality is required*")]
        [InlineData("John", "CIT", "PR", "j@o.com", "+351911111111", "*ISO 3166-1 alpha-3*")]
        [InlineData("John", "CIT", "PRT", "bad-email", "+351911111111", "*Email is not valid*")]
        [InlineData("John", "CIT", "PRT", "j@o.com", "abc", "*E.164*")]
        public void Ctor_InvalidData_Throws(string name, string cid, string nat, string email, string phone, string msg)
        {
            Action act = () => new Representative(Guid.NewGuid(), name, cid, nat, email, phone);
            act.Should().Throw<ArgumentException>().WithMessage(msg);
        }

        [Fact]
        public void UpdateProfile_ChangesFields_AndValidates()
        {
            var rep = new Representative(Guid.NewGuid(), "Ana", "C1", "PRT", "ana@org.com", "+351911111111");

            rep.UpdateProfile("Ana Maria", "C1", "PRT", "ana.maria@org.com", "+351922222222");

            rep.Name.Should().Be("Ana Maria");
            rep.Email.Should().Be("ana.maria@org.com");
            rep.Phone.Should().Be("+351922222222");
        }

        [Fact]
        public void SetActive_Toggles()
        {
            var rep = new Representative(Guid.NewGuid(), "Bob", "C2", "PRT", "bob@org.com", "+351911111111");
            rep.IsActive.Should().BeTrue();

            rep.SetActive(false);
            rep.IsActive.Should().BeFalse();

            rep.SetActive(true);
            rep.IsActive.Should().BeTrue();
        }
    }
}
