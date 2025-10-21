using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;

namespace WebApp.Models.Application.Services.Resources
{
    public class ResourceService : IResourceService
    {
        private readonly IResourceRepository _resourceRepo;

        public ResourceService(IResourceRepository resourceRepo)
        {
            _resourceRepo = resourceRepo;
        }

        public void RegisterResource(
            string id,
            string description,
            ResourceType type,
            int operationalCapacity,
            ResourceAvailabilityStatus status,
            int setupTime,
            HashSet<Qualification> qualifications)
        {
            if (_resourceRepo.GetById(id) != null)
                throw new ArgumentException($"A resource with ID '{id}' already exists.");

            var resource = new Resource(
                id,
                description,
                type,
                operationalCapacity,
                status,
                setupTime,
                qualifications
            );

            _resourceRepo.AddResource(resource);
        }

        public Resource? GetResourceById(string id) =>
            _resourceRepo.GetById(id);

        public Resource? GetResourceByDescription(string description) =>
            _resourceRepo.GetByDescription(description);

        public List<Resource> GetAllResources() =>
            _resourceRepo.GetAll();

        public List<Resource> GetResourcesByType(ResourceType type) =>
            _resourceRepo.GetByType(type);

        public List<Resource> GetResourcesByStatus(ResourceAvailabilityStatus status) =>
            _resourceRepo.GetByStatus(status);

        public void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus)
        {
            var resource = _resourceRepo.GetById(id)
                ?? throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            _resourceRepo.UpdateAvailability(id, newStatus);
        }
    }
}
