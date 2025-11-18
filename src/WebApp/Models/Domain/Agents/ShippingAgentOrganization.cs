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

        /// <summary>
        /// Mantido para compatibilidade interna.
        /// </summary>
        public void Update(string legalName, string? alternativeNames, string address, string taxNumber)
        {
            LegalName = ValidateLegalName(legalName);
            AlternativeNames = NormalizeAlternativeNames(alternativeNames);
            Address = ValidateAddress(address);
            TaxNumber = ValidateTaxNumber(taxNumber);
        }

        /// <summary>
        /// Novo: usado pelos services (mantém a assinatura pedida).
        /// </summary>
        public void UpdateProfile(string legalName, string? alternativeNames, string address, string taxNumber)
            => Update(legalName, alternativeNames, address, taxNumber);

        /// <summary>
        /// Adiciona um representante garantindo unicidade por Email e CitizenId na organização.
        /// </summary>
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

        /// <summary>
        /// Atualiza campos de um representante e volta a verificar unicidade de Email e CitizenId.
        /// </summary>
        public void UpdateRepresentative(
            Guid representativeId,
            string name,
            string citizenId,
            string nationality,
            string email,
            string phone)
        {
            var rep = Representatives.FirstOrDefault(r => r.Id == representativeId)
                      ?? throw new KeyNotFoundException("Representative not found.");

            // Verifica unicidade (exclui o próprio)
            if (Representatives.Any(r => r.Id != rep.Id &&
                                         r.Email.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Another representative already uses email '{email}' in this organization.");

            if (Representatives.Any(r => r.Id != rep.Id &&
                                         r.CitizenId.Equals(citizenId.Trim(), StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Another representative already uses citizen ID '{citizenId}' in this organization.");

            rep.UpdateProfile(name, citizenId, nationality, email, phone);
        }

        public void DeactivateRepresentative(Guid representativeId)
        {
            var rep = Representatives.FirstOrDefault(r => r.Id == representativeId)
                      ?? throw new KeyNotFoundException("Representative not found.");

            if (!rep.IsActive) return;

            if (Representatives.Count(r => r.IsActive) <= 1)
                throw new InvalidOperationException("Organization must keep at least one active representative.");

            rep.SetActive(false);
        }

        public void ActivateRepresentative(Guid representativeId)
        {
            var rep = Representatives.FirstOrDefault(r => r.Id == representativeId)
                      ?? throw new KeyNotFoundException("Representative not found.");
            rep.SetActive(true);
        }

        public void RemoveRepresentative(Guid representativeId)
        {
            var rep = Representatives.FirstOrDefault(r => r.Id == representativeId)
                      ?? throw new KeyNotFoundException("Representative not found.");

            if (rep.IsActive && Representatives.Count(r => r.IsActive) <= 1)
                throw new InvalidOperationException("Cannot remove the last active representative.");

            Representatives.Remove(rep);
        }

        /// <summary>Verifica se existe pelo menos um representante (ou um ativo).</summary>
        public void EnsureHasAtLeastOneRepresentative(bool mustBeActive = false)
        {
            var count = mustBeActive ? Representatives.Count(r => r.IsActive) : Representatives.Count;
            if (count == 0)
                throw new InvalidOperationException(mustBeActive
                    ? "At least one active representative is required."
                    : "At least one representative is required.");
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
            if (string.IsNullOrWhiteSpace(value)) return null; // opcional
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
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Tax number is required.", nameof(value));

            var v = value.Trim().ToUpperInvariant();

            if (v.Length < 3 || v.Length > 32)
                throw new ArgumentException("Tax number must be between 3 and 32 characters.", nameof(value));

            // Tem de começar por dígito e só pode ter dígitos, '-' ou '.'
            if (!Regex.IsMatch(v, @"^[0-9][0-9\-\.]{2,31}$"))
                throw new ArgumentException(
                    "Tax number must start with a digit and contain only digits, '-' or '.', with 3–32 characters.",
                    nameof(value));

            return v;
        }
    }
}
