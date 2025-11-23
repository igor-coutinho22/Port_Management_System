using System.Text.RegularExpressions;

namespace WebApp.Models.Domain.Agents
{
    public class ShippingAgentOrganization
    {
        public Guid Id { get; private set; }
        public string Identifier { get; private set; } = default!;
        public string LegalName { get; private set; } = default!;
        public string? AlternativeNames { get; private set; }
        public string Address { get; private set; } = default!;
        public string TaxNumber { get; private set; } = default!;
        public bool IsActive { get; private set; } = true;

        public ICollection<Representative> Representatives { get; private set; } = new List<Representative>();

        private ShippingAgentOrganization() { } // EF

        public ShippingAgentOrganization(string identifier, string legalName, string? alternativeNames, string address, string taxNumber)
        {
            Id = Guid.NewGuid();
            Identifier = ValidateIdentifier(identifier);
            LegalName = ValidateLegalName(legalName);
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
            Address = ValidateAddress(address);
            TaxNumber = ValidateTaxNumber(taxNumber);
        }

        public void UpdateProfile(string? alternativeNames, string address)
        {
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
            Address = ValidateAddress(address);
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        public void AddRepresentative(Representative rep)
        {
            if (rep is null) throw new ArgumentNullException(nameof(rep));
            if (rep.OrganizationId != Id)
                throw new InvalidOperationException("Representative.OrganizationId must match ShippingAgentOrganization.Id.");

            if (Representatives.Any(r => r.Email.Equals(rep.Email, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"A representative with email '{rep.Email}' already exists in this organization.");

            if (Representatives.Any(r => r.CitizenId.Equals(rep.CitizenId, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"A representative with citizen ID '{rep.CitizenId}' already exists in this organization.");

            Representatives.Add(rep);
        }

        public void EnsureHasAtLeastOneRepresentative(bool mustBeActive = false)
        {
            var count = mustBeActive ? Representatives.Count(r => r.IsActive) : Representatives.Count;
            if (count == 0)
                throw new InvalidOperationException(mustBeActive
                    ? "At least one active representative is required."
                    : "At least one representative is required.");
        }

        public void UpdateAlternativeNames(string? alternativeNames)
        {
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
        }

        public void UpdateAddress(string address)
        {
            Address = ValidateAddress(address);
        }

        // ===== Validations =====
        private static string ValidateIdentifier(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Identifier is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 50) 
                throw new ArgumentException("Identifier must be at most 50 characters.", nameof(value));
            return v;
        }

        private static string ValidateLegalName(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Legal name is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 30) 
                throw new ArgumentException("Legal name must be at most 30 characters.", nameof(value));
            return v;
        }

        private static string? NormalizeAlternativeNames(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var v = value.Trim();
            if (v.Length > 50) 
                throw new ArgumentException("Alternative names must be at most 50 characters.", nameof(value));
            return v;
        }

        private static string ValidateAddress(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Address is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 100) 
                throw new ArgumentException("Address must be at most 100 characters.", nameof(value));
            return v;
        }

        private static string ValidateTaxNumber(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Tax number is required.", nameof(value));

            var v = value.Trim().ToUpperInvariant();

            if (v.Length < 3 || v.Length > 32)
                throw new ArgumentException("Tax number must be between 3 and 32 characters.", nameof(value));

            if (!Regex.IsMatch(v, @"^[0-9][0-9\-\.]{2,31}$"))
                throw new ArgumentException(
                    "Tax number must start with a digit and contain only digits, '-' or '.', with 3–32 characters.",
                    nameof(value));

            return v;
        }
        public void RemoveRepresentative(Guid representativeId)
        {
            var rep = Representatives.FirstOrDefault(r => r.Id == representativeId)
                    ?? throw new KeyNotFoundException("Representative not found in this organization.");

            if (rep.IsActive && Representatives.Count(r => r.IsActive) <= 1)
                throw new InvalidOperationException("Cannot remove the last active representative.");

            Representatives.Remove(rep);
        }
    }
}