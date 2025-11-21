// File: WebApp/Models/Domain/Agents/Representative.cs
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace WebApp.Models.Domain.Agents
{
    public class Representative
    {
        public Guid Id { get; private set; }
        public Guid OrganizationId { get; private set; }
        public ShippingAgentOrganization Organization { get; private set; } = default!;
        public string Name { get; private set; } = default!;
        public string CitizenId { get; private set; } = default!;
        public string Nationality { get; private set; } = default!;
        public string Email { get; private set; } = default!;
        public string Phone { get; private set; } = default!;
        public bool IsActive { get; private set; } = true;

        private Representative() { } // EF

        public Representative(Guid organizationId, string name, string citizenId, string nationality, string email, string phone)
        {
            Id = Guid.NewGuid();
            OrganizationId = organizationId != Guid.Empty
                ? organizationId
                : throw new ArgumentException("OrganizationId is required.", nameof(organizationId));

            Name = ValidateName(name);
            CitizenId = ValidateCitizenId(citizenId);
            Nationality = ValidateNationality(nationality);
            Email = ValidateEmail(email);
            Phone = ValidatePhone(phone);
        }

        public void UpdateProfile(string nationality, string email, string phone)
        {
            Nationality = ValidateNationality(nationality);
            Email = ValidateEmail(email);
            Phone = ValidatePhone(phone);
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        // ===== Validations =====
        private static string ValidateName(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Name is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 120) 
                throw new ArgumentException("Name must be at most 120 characters.", nameof(value));
            return v;
        }

        private static string ValidateCitizenId(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("CitizenId is required.", nameof(value));
            var v = value.Trim().ToUpperInvariant();
            if (v.Length is < 3 or > 64) 
                throw new ArgumentException("CitizenId must be 3–64 characters.", nameof(value));
            if (!Regex.IsMatch(v, @"^[A-Z0-9]+$"))
                throw new ArgumentException("CitizenId must be alphanumeric only.", nameof(value));
            return v;
        }

        private static string ValidateNationality(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Nationality is required (ISO3).", nameof(value));
            if (value.Length != 2 && value.Length != 3)
            {
                throw new ArgumentException("Nationality must be a valid 2-letter or 3-letter country code (eg: PT or PRT).");
            }
            return value.ToUpperInvariant();
        }

        private static string ValidateEmail(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Email is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 200) 
                throw new ArgumentException("Email must be at most 200 characters.", nameof(value));
            try { _ = new MailAddress(v); }
            catch { throw new ArgumentException("Email is not valid.", nameof(value)); }
            return v;
        }

        private static string ValidatePhone(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) 
                throw new ArgumentException("Phone is required.", nameof(value));
            var v = value.Trim();
            if (v.Length > 32) 
                throw new ArgumentException("Phone must be at most 32 characters.", nameof(value));
            if (!Regex.IsMatch(v, @"^\+?[0-9]{6,15}$"))
                throw new ArgumentException("Phone must follow E.164 format (e.g., +351912345678).", nameof(value));
            return v;
        }

        public void UpdateEmail(string email)
        {
            Email = ValidateEmail(email);
        }

        public void UpdatePhone(string phone)
        {
            Phone = ValidatePhone(phone);
        }

        public void UpdateNationality(string nationality)
        {
            Nationality = ValidateNationality(nationality);
        }
    }
}