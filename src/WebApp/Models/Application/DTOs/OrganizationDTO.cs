using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Application.DTOs
{
    public class CreateOrganizationRequest
    {
        public CreateOrganizationRequest() { }

        // Mantém o construtor usado nos testes (e em qualquer código existente)
        public CreateOrganizationRequest(
            string legalName,
            string alternativeNames,
            string address,
            string taxNumber,
            IEnumerable<CreateRepresentativeRequest> representatives)
        {
            LegalName = legalName;
            AlternativeNames = alternativeNames;
            Address = address;
            TaxNumber = taxNumber;
            Representatives = representatives?.ToList() ?? new List<CreateRepresentativeRequest>();
        }

        [Required, MaxLength(200)]
        public string LegalName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AlternativeNames { get; set; }

        [Required, MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Required, MaxLength(32)]
        [RegularExpression(@"^[0-9][0-9\.\-]{2,31}$",
            ErrorMessage = "Tax number must start with a digit and can contain only digits, '-' or '.', with 3–32 characters.")]
        public string TaxNumber { get; set; } = string.Empty;

        // Pelo menos 1 representante
        [MinLength(1, ErrorMessage = "At least one representative is required.")]
        public List<CreateRepresentativeRequest> Representatives { get; set; } = new();
    }

    public class UpdateOrganizationRequest
    {
        public UpdateOrganizationRequest() { }

        public UpdateOrganizationRequest(
            string legalName,
            string alternativeNames,
            string address,
            string taxNumber)
        {
            LegalName = legalName;
            AlternativeNames = alternativeNames;
            Address = address;
            TaxNumber = taxNumber;
        }

        [Required, MaxLength(200)]
        public string LegalName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AlternativeNames { get; set; }

        [Required, MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Required, MaxLength(32)]
        [RegularExpression(@"^[0-9][0-9\.\-]{2,31}$",
            ErrorMessage = "Tax number must start with a digit and can contain only digits, '-' or '.', with 3–32 characters.")]
        public string TaxNumber { get; set; } = string.Empty;
    }

    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string LegalName { get; set; } = string.Empty;
        public string? AlternativeNames { get; set; }
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;

        // NOVO: representatives vêm juntos com a organização
        public List<RepresentativeDto> Representatives { get; set; } = new();
    }
}
