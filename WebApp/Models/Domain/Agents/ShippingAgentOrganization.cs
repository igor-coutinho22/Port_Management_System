using WebApp.Models.Domain.Common;

namespace WebApp.Models.Domain.Agents
{
    public class ShippingAgentOrganization : BaseEntity
    {
        public string LegalName { get; private set; } = default!;
        public string AlternativeNames { get; private set; }
        public string Address { get; private set; } = default!;
        public string TaxNumber { get; private set; } = default!;
        public ICollection<Representative> Representatives { get; private set; } = new List<Representative>();

        private ShippingAgentOrganization() { } // EF

        public ShippingAgentOrganization(string legalName, string? alternativeNames, string address, string taxNumber)
        {
            Id = Guid.NewGuid();
            LegalName = legalName;
            AlternativeNames = alternativeNames;
            Address = address;
            TaxNumber = taxNumber;
        }

        public void AddRepresentative(Representative rep) => Representatives.Add(rep);
    }
}
