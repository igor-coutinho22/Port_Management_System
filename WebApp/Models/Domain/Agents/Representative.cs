using WebApp.Models.Domain.Common;

namespace WebApp.Models.Domain.Agents
{
    public class Representative : BaseEntity
    {
        public Guid OrganizationId { get; private set; }
        public ShippingAgentOrganization Organization { get; private set; } = default!;
        public string Name { get; private set; } = default!;
        public string CitizenId { get; private set; } = default!;
        public string Nationality { get; private set; } = default!;
        public string Email { get; private set; } = default!;
        public string Phone { get; private set; } = default!;

        private Representative() { } // EF

        public Representative(Guid organizationId, string name, string citizenId, string nationality, string email, string phone)
        {
            Id = Guid.NewGuid();
            OrganizationId = organizationId;
            Name = name;
            CitizenId = citizenId;
            Nationality = nationality;
            Email = email;
            Phone = phone;
        }
    }
}
