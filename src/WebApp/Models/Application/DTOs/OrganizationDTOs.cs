namespace WebApp.Models.Application.DTOs
{
    public record CreateOrganizationRequest(
        string LegalName,
        string AlternativeNames,
        string Address,
        string TaxNumber,
        IEnumerable<CreateRepresentativeRequest> Representatives
    );

    // NOVO: request para update
    public record UpdateOrganizationRequest(
        string LegalName,
        string AlternativeNames,
        string Address,
        string TaxNumber
    );

    public record OrganizationDto(
        Guid Id,
        string LegalName,
        string AlternativeNames,
        string Address,
        string TaxNumber
    );
}
