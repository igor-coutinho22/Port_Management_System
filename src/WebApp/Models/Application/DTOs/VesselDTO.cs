namespace WebApp.Models.Application.DTOs
{
    public class VesselDTO
    {
        public string? IMO { get; set; }
        public string? VesselName { get; set; }
        public string? OperatorName { get; set; }
        public int RequiredCraneCount { get; set; }
        public double RequiredDockLength { get; set; }
        public int Bays { get; set; }
        public int Rows { get; set; }
        public int Tiers { get; set; }
    }
}