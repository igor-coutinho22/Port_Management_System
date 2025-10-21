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

        // async methods
        Task RegisterResourceAsync(string id, string description, ResourceType type, int operationalCapacity, ResourceAvailabilityStatus status, int setupTime, HashSet<Qualification> qualifications);
        Task<Resource?> GetResourceByIdAsync(string id);
        Task<Resource?> GetResourceByDescriptionAsync(string description);
        Task<List<Resource>> GetAllResourcesAsync();
        Task<List<Resource>> GetResourcesByTypeAsync(ResourceType type);
        Task<List<Resource>> GetResourcesByStatusAsync(ResourceAvailabilityStatus status);
        Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus);
        Task ActivateAsync(string id);
        Task DeactivateAsync(string id);
        Task PutInMaintenanceAsync(string id);
        Task EndMaintenanceAsync(string id);
        Task DeleteAsync(string id);

    }
}
