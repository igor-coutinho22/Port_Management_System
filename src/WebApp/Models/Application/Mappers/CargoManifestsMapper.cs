using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Application.Mappers
{
    public static class CargoManifestsMapper
    {
        public static CargoManifestDTO ToDTO(CargoManifest entity)
        {
            return new CargoManifestDTO
            {
                Id = entity.Id,
                Type = entity.Type.ToString(),
                Containers = entity.Containers.Select(c => new ContainerDTO
                {
                    Identifier = c.Identifier
                }).ToList()
            };
        }

        public static CargoManifest ToEntity(CargoManifestDTO dto)
        {
            var manifest = new CargoManifest(Enum.Parse<CargoManifestType>(dto.Type, ignoreCase: true));
            if (dto.Containers != null)
            {
                foreach (var containerDto in dto.Containers)
                {
                    manifest.AddContainer(new Container(containerDto.Identifier));
                }
            }
            return manifest;
        }
    }
}