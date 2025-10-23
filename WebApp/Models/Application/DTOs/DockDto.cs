namespace WebApp.Models.Application.DTOs
{
    public class DockDto
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double LengthMeters { get; set; }
        public double DepthMeters { get; set; }
        public double MaxDraftMeters { get; set; }
        public List<Guid> AllowedVesselTypeIds { get; set; } = new();
    }
}