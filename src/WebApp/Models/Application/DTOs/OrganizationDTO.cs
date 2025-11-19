// File: WebApp/Models/Application/DTOs/OrganizationDtos.cs
namespace WebApp.Models.Application.DTOs
{
    public record OrganizationDto(
        Guid Id,
        string Identifier,
        string LegalName,
        string? AlternativeName,
        string Address,
        string TaxNumber,
        bool IsActive
    );

    public class CreateOrganizationRequest
    {
        public string Identifier { get; set; } = string.Empty;
        public string LegalName { get; set; } = string.Empty;
        public string? AlternativeName { get; set; }
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public List<CreateRepresentativeRequest> Representatives { get; set; } = new();
    }

    public class UpdateOrganizationRequest
    {
        public string LegalName { get; set; } = string.Empty;
        public string? AlternativeName { get; set; }
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}