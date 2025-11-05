using System;
using FluentAssertions;
using WebApp.Models.Domain.Agents;
using Xunit;

namespace WebApp.Tests.Domain
{
    public class ShippingAgentOrganizationDomainTests
    {
        [Fact]
        public void UpdateProfile_ValidData_ChangesProperties()
        {
            var org = new ShippingAgentOrganization("A","A","Addr","PT-1");
            var rep = new Representative(org.Id,"Rep","CID123","PRT","r@a.com","+351911111111");
            org.AddRepresentative(rep);

            org.UpdateProfile("NewA","NA","NewAddr","PT-1");
            org.LegalName.Should().Be("NewA");
            org.Address.Should().Be("NewAddr");
        }

        [Fact]
        public void AddRepresentative_DuplicateEmail_Throws()
        {
            var org = new ShippingAgentOrganization("A","A","Addr","PT-1");
            var r1 = new Representative(org.Id,"R1","CID456","PRT","dup@mail.com","+351911111111");
            org.AddRepresentative(r1);

            var r2 = new Representative(org.Id,"R2","CID789","PRT","dup@mail.com","+351922222222");

            FluentActions.Invoking(() => org.AddRepresentative(r2))
                .Should().Throw<InvalidOperationException>()
                .WithMessage("*email*already exists*");
        }
    }
}
