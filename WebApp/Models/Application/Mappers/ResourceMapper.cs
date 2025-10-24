using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Application.Mappers
{
    public static class ResourceMapper
    {
        // Converts a domain Resource entity to a DTO.
        public static ResourceDTO ToDTO(Resource resource)
        {
            if (resource == null)
                throw new ArgumentNullException(nameof(resource));

            return new ResourceDTO
            {
                Id = resource.Id!,
                Description = resource.Description!,
                ResourceType = resource.ResourceType,
                OperationalCapacity = resource.OperationalCapacity,
                Status = resource.Status,
                SetupTime = resource.SetupTime,
                QualificationRequirements = resource.qualificationRequirements ?? new HashSet<Qualification>()
            };
        }

        // Converts a ResourceDTO back to the domain Resource entity.
        public static Resource ToDomain(ResourceDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Resource(
                id: dto.Id!,
                description: dto.Description!,
                type: dto.ResourceType,
                operationalCapacity: dto.OperationalCapacity,
                status: dto.Status,
                setupTime: dto.SetupTime,
                qualifications: dto.QualificationRequirements ?? new HashSet<Qualification>()
            );
        }
    }
}
