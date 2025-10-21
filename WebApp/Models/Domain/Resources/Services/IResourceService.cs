using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources.Enums;

namespace WebApp.Models.Domain.Resources.Interfaces
{
    public interface IResourceService
    {
        void RegisterResource(
            string id,
            string description,
            ResourceType type,
            int operationalCapacity,
            ResourceAvailabilityStatus status,
            int setupTime,
            HashSet<Qualification> qualifications);

        Resource? GetResourceById(string id);
        Resource? GetResourceByDescription(string description);
        List<Resource> GetAllResources();
        List<Resource> GetResourcesByType(ResourceType type);
        List<Resource> GetResourcesByStatus(ResourceAvailabilityStatus status);
        void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus);
    }
}
