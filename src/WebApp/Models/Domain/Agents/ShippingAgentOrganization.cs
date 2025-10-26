using System.Text.RegularExpressions;
using WebApp.Models.Domain.Common;

namespace WebApp.Models.Domain.Agents
{
    public class ShippingAgentOrganization : BaseEntity
    {
        public string LegalName { get; private set; } = default!;
        public string? AlternativeNames { get; private set; }
        public string Address { get; private set; } = default!;
        public string TaxNumber { get; private set; } = default!;
        public ICollection<Representative> Representatives { get; private set; } = new List<Representative>();

        private ShippingAgentOrganization() { } // EF

        public ShippingAgentOrganization(string legalName, string? alternativeNames, string address, string taxNumber)
        {
            Id = Guid.NewGuid();
            LegalName = ValidateLegalName(legalName);
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
            Address = ValidateAddress(address);
            TaxNumber = ValidateTaxNumber(taxNumber);
        }

        public void Update(string legalName, string? alternativeNames, string address, string taxNumber)
        {
            LegalName = ValidateLegalName(legalName);
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
            Address = ValidateAddress(address);
            TaxNumber = ValidateTaxNumber(taxNumber);
        }

        /// Adiciona um representante garantindo unicidade de email por organização
        /// e coerência do OrganizationId.
        public void AddRepresentative(Representative rep)
        {
            if (rep is null) throw new ArgumentNullException(nameof(rep));
            if (rep.OrganizationId != Id)
                throw new InvalidOperationException("Representative.OrganizationId must match ShippingAgentOrganization.Id.");

            // Unicidade por (OrganizationId, Email) – já reforçada por índice único em EF, aqui validamos ao nível de domínio
            if (Representatives.Any(r => r.Email.Equals(rep.Email, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"A representative with email '{rep.Email}' already exists in this organization.");

            Representatives.Add(rep);
        }

        /// Usa esta verificação antes de persistir/considerar o registo concluído pela US 2.2.5.
        public void EnsureHasAtLeastOneRepresentative()
        {
            if (Representatives.Count == 0)
                throw new InvalidOperationException("At least one representative is required to register an organization.");
        }

        // ===== Validations (private) =====
        private static string ValidateLegalName(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Legal name is required.", nameof(value));
            if (value.Length > 200) throw new ArgumentException("Legal name must be at most 200 characters.", nameof(value));
            return value.Trim();
        }

        private static string? NormalizeAlternativeNames(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null; // campo opcional
            var v = value.Trim();
            if (v.Length > 200) throw new ArgumentException("Alternative names must be at most 200 characters.", nameof(value));
            return v;
        }

        private static string ValidateAddress(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Address is required.", nameof(value));
            if (value.Length > 300) throw new ArgumentException("Address must be at most 300 characters.", nameof(value));
            return value.Trim();
        }

        private static string ValidateTaxNumber(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Tax number is required.", nameof(value));
            var v = value.Trim().ToUpperInvariant();
            if (v.Length > 32) throw new ArgumentException("Tax number must be at most 32 characters.", nameof(value));
            // genérico (multi-país): alfanumérico com separadores comuns
            if (!Regex.IsMatch(v, @"^[A-Z0-9\-\.]{3,32}$"))
                throw new ArgumentException("Tax number must be alphanumeric (may include '-' or '.') and 3–32 chars.", nameof(value));
            return v;
        }
    }
}
