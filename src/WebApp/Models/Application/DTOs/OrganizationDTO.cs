namespace WebApp.Models.Application.DTOs
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string? Identifier { get; set; }
        public string? LegalName { get; set; }
        public string? AlternativeNames { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public bool IsActive { get; set; }
    };

    public class CreateOrganizationDto
    {
        public string Identifier { get; set; } = string.Empty;
        public string LegalName { get; set; } = string.Empty;
        public string? AlternativeName { get; set; }
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public List<CreateRepresentativeDto> Representatives { get; set; } = new();
    }

    public class UpdateOrganizationDto
    {
        public string? AlternativeNames { get; set; }
        public string Address { get; set; } = string.Empty;
    }
}