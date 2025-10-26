namespace WebApp.Models.Application.DTOs
{
    public class VesselTypeDTO
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int MaxBays { get; set; }
        public int MaxRows { get; set; }
        public int MaxTiers { get; set; }
    }
}