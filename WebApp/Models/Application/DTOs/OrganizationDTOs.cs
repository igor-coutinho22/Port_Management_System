namespace WebApp.Models.Application.DTOs
{
    public record CreateOrganizationRequest(
        string LegalName,
        string AlternativeNames,
        string Address,
        string TaxNumber,
        IEnumerable<CreateRepresentativeRequest> Representatives
    );

    public record OrganizationDto(
        Guid Id,
        string LegalName,
        string AlternativeNames,
        string Address,
        string TaxNumber
    );

    public record CreateRepresentativeRequest(
        string Name, string CitizenId, string Nationality, string Email, string Phone
    );
}
