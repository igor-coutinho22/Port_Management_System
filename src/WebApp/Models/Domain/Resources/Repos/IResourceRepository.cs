using WebApp.Models.Domain.Resources.Enums;

namespace WebApp.Models.Domain.Resources.Interfaces
{
    public interface IResourceRepository
    {
        void AddResource(Resource resource);
        Resource? GetById(string id);
        Resource? GetByDescription(string description);
        List<Resource> GetAll();
        List<Resource> GetByType(ResourceType type);
        List<Resource> GetByStatus(ResourceAvailabilityStatus status);
        void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus);

        //Async methods
        Task AddResourceAsync(Resource resource);
        Task<Resource?> GetByIdAsync(string id);
        Task<Resource?> GetByDescriptionAsync(string description);
        Task UpdateAsync(Resource resource);
        Task<List<Resource>> GetAllAsync();
        Task<List<Resource>> GetByTypeAsync(ResourceType type);
        Task<List<Resource>> GetByStatusAsync(ResourceAvailabilityStatus status);
        Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus);
        Task UpdateResourceAsync(Resource resource);
        Task DeleteAsync(string id);
    }
}
