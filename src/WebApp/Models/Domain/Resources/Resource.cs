using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources.Enums;

namespace WebApp.Models.Domain.Resources;

public class Resource
{
    public string? Id { get; set; }
    public string? Description { get; set; }
    public ResourceType ResourceType { get; set; }
    public int OperationalCapacity { get; set; }
    public ResourceAvailabilityStatus Status { get; set; }
    public int SetupTime { get; set; }
    public ICollection<Qualification> QualificationRequirements { get; set; } = new HashSet<Qualification>();

    protected Resource() { }

    public Resource(
        string id,
        string description,
        ResourceType type,
        int operationalCapacity,
        ResourceAvailabilityStatus status,
        int setupTime,
        HashSet<Qualification> qualifications)
    {
        Id = id;
        Description = description;
        ResourceType = type;
        OperationalCapacity = operationalCapacity;
        Status = status;
        SetupTime = setupTime;
        QualificationRequirements = qualifications;
    }
}
