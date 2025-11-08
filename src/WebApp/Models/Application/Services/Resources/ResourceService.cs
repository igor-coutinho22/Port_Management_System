using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;

namespace WebApp.Models.Application.Services.Resources
{
    public class ResourceService : IResourceService
    {
        private readonly IResourceRepository _resourceRepo;
        private readonly IQualificationRepository _qualificationRepo;

        public ResourceService(IResourceRepository resourceRepo, IQualificationRepository qualificationRepo)
        {
            _resourceRepo = resourceRepo;
            _qualificationRepo = qualificationRepo;
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

            _resourceRepo.AddResourceAsync(resource);
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

        public async Task UpdateResourceAsync(Resource resource)
        {
            if (resource == null)
                throw new ArgumentNullException(nameof(resource));

            var existing = await _resourceRepo.GetByIdAsync(resource.Id!);
            if (existing == null)
                throw new KeyNotFoundException($"Resource with ID '{resource.Id}' not found.");

            existing.Description = resource.Description;
            existing.OperationalCapacity = resource.OperationalCapacity;
            existing.SetupTime = resource.SetupTime;
            existing.Status = resource.Status;
            existing.ResourceType = resource.ResourceType;
            existing.qualificationRequirements = resource.qualificationRequirements;

            await _resourceRepo.UpdateAsync(existing);
        }

        public void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus)
        {
            var resource = _resourceRepo.GetById(id)
                ?? throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            _resourceRepo.UpdateAvailability(id, newStatus);
        }

        //Async Methods

        public async Task DeleteAsync(string id)
            => await _resourceRepo.DeleteAsync(id);
        public async Task ActivateAsync(string id)
        {
            var resource = await _resourceRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Resource '{id}' not found.");

            if (resource.Status == ResourceAvailabilityStatus.Active)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot be activated.");

            if (resource.Status == ResourceAvailabilityStatus.UnderMaintenance)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot be activated.");

            await _resourceRepo.UpdateAvailabilityAsync(id, ResourceAvailabilityStatus.Active);
        }

        public async Task DeactivateAsync(string id)
        {
            var resource = await _resourceRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Resource '{id}' not found.");

            if (resource.Status == ResourceAvailabilityStatus.Inactive)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot be deactivated.");

            await _resourceRepo.UpdateAvailabilityAsync(id, ResourceAvailabilityStatus.Inactive);
        }

        public async Task PutInMaintenanceAsync(string id)
        {
            var resource = await _resourceRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Resource '{id}' not found.");

            if (resource.Status == ResourceAvailabilityStatus.UnderMaintenance)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot be set for maintenance.");

            if (resource.Status == ResourceAvailabilityStatus.Inactive)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot be set for maintenance.");

            await _resourceRepo.UpdateAvailabilityAsync(id, ResourceAvailabilityStatus.UnderMaintenance);
        }

        public async Task EndMaintenanceAsync(string id)
        {
            var resource = await GetResourceByIdAsync(id)
                ?? throw new KeyNotFoundException($"Resource '{id}' not found.");

            if (resource.Status != ResourceAvailabilityStatus.UnderMaintenance)
                throw new InvalidOperationException($"A resource with status '{resource.Status}' cannot end maintenance.");

            await _resourceRepo.UpdateAvailabilityAsync(id, ResourceAvailabilityStatus.Active);
        }
        
        public async Task RegisterResourceAsync(
            string id,
            string description,
            ResourceType type,
            int operationalCapacity,
            ResourceAvailabilityStatus status,
            int setupTime,
            HashSet<Qualification> qualifications)
        {
            
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("Resource ID cannot be null or empty.");
            
            var existing = await _resourceRepo.GetByIdAsync(id);
            if (existing != null)
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

            await _resourceRepo.AddResourceAsync(resource);
        }

        public async Task RegisterResourceAsync(Resource resource)
        {
            if (resource == null)
                throw new ArgumentNullException(nameof(resource));

            if (string.IsNullOrWhiteSpace(resource.Id))
                throw new ArgumentException("Resource ID cannot be null or empty.");

            var existing = await _resourceRepo.GetByIdAsync(resource.Id!);
            if (existing != null)
                throw new ArgumentException($"A resource with ID '{resource.Id}' already exists.");

            // Handle qualifications properly to avoid FK constraint violations
            if (resource.qualificationRequirements != null && resource.qualificationRequirements.Any())
            {
                var qualificationCodes = resource.qualificationRequirements.Select(q => q.Code).ToList();
                var existingQualifications = new HashSet<Qualification>();
                
                foreach (var code in qualificationCodes)
                {
                    var existingQual = await _qualificationRepo.GetByCodeAsync(code);
                    if (existingQual != null)
                    {
                        existingQualifications.Add(existingQual);
                    }
                    else
                    {
                        throw new ArgumentException($"Qualification with code '{code}' does not exist in the database.");
                    }
                }
                
                // Replace with the actual tracked entities from database
                resource.qualificationRequirements = existingQualifications;
            }

            await _resourceRepo.AddResourceAsync(resource);
        }


        public async Task<Resource?> GetResourceByIdAsync(string id) =>
            await _resourceRepo.GetByIdAsync(id);

        public async Task<Resource?> GetResourceByDescriptionAsync(string description) =>
            await _resourceRepo.GetByDescriptionAsync(description);

        public async Task<List<Resource>> GetAllResourcesAsync() =>
            await _resourceRepo.GetAllAsync();

        public async Task<List<Resource>> GetResourcesByTypeAsync(ResourceType type) =>
            await _resourceRepo.GetByTypeAsync(type);

        public async Task<List<Resource>> GetResourcesByStatusAsync(ResourceAvailabilityStatus status) =>
            await _resourceRepo.GetByStatusAsync(status);

        public async Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus)
        {
            var resource = await _resourceRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            await _resourceRepo.UpdateAvailabilityAsync(id, newStatus);
        }


    }
    
    
}
