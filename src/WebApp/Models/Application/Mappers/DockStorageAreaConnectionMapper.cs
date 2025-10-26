namespace WebApp.Models.Application.Mappers
{
    using WebApp.Models.Domain.StorageArea;
    using WebApp.Models.Application.DTOs;

    public static class DockStorageAreaConnectionMapper
    {
        // Converts a domain StorageArea entity to a DTO.
        public static DockStorageAreaConnectionDTO MapToDto(DockStorageAreaConnection storageAreaConnection)
        {
            if (storageAreaConnection == null)
                throw new ArgumentNullException(nameof(storageAreaConnection));

            return new DockStorageAreaConnectionDTO
            {
                DockId = storageAreaConnection.DockId,
                StorageAreaId = storageAreaConnection.StorageAreaId,
                DistanceMeters = storageAreaConnection.DistanceMeters,
                TravelSeconds = storageAreaConnection.TravelSeconds
            };
        }

        // Converts a StorageAreaConnectionDTO back to the domain StorageArea entity.
        public static DockStorageAreaConnection MapToDomain(DockStorageAreaConnectionDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new DockStorageAreaConnection(
                dockId: dto.DockId,
                storageAreaId: dto.StorageAreaId,
                distanceMeters: dto.DistanceMeters,
                travelSeconds: dto.TravelSeconds
            );
        }
    };
}