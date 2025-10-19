namespace WebApp.Models.Application.DTOs
{
    public record VesselDTO(
        string IMO,
        string VesselName,
        string OperatorName,
        string VesselType,
        int RequiredCraneCount,
        double RequiredDockLength,
        int Bays,
        int Rows,
        int Tiers
    );
}