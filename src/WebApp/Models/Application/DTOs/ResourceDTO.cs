using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources.Enums;

namespace WebApp.Models.Domain.Resources;

public class ResourceDTO
{
    public string? Id { get; set; }
    public string? Description { get; set; }
    public ResourceType ResourceType { get; set; }
    public int OperationalCapacity { get; set; }
    public ResourceAvailabilityStatus Status { get; set; }
    public int SetupTime { get; set; }
    public HashSet<Qualification>? QualificationRequirements { get; set; }
}