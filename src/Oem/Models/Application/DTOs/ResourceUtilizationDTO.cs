namespace Oem.Models.Application.DTOs
{
    public class ResourceUtilizationDTO
    {
        public string ResourceName { get; set; } = string.Empty;
        public double TotalAllocatedMinutes { get; set; }
        public int TotalOperations { get; set; }
    }
}
