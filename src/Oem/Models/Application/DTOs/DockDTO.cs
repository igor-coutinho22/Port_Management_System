namespace Oem.Models.Application.DTOs
{
    public class DockDTO
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double LengthMeters { get; set; }
        public double DepthMeters { get; set; }
        public double MaxDraftMeters { get; set; }
        public List<string> AllowedVesselTypes { get; set; } = new();
    }
}