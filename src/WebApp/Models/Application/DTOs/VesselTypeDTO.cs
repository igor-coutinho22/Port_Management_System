namespace WebApp.Models.Application.DTOs
{
    public record VesselTypeDTO(
        string Name,
        string Description,
        int MaxBays,
        int MaxRows,
        int MaxTiers
    );
}