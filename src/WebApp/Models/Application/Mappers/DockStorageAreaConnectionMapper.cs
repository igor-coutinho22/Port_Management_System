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
                DistanceMeters = storageAreaConnection.DistanceMeters,
                TravelSeconds = storageAreaConnection.TravelSeconds
            };
        }

        // Converts a StorageArea entity to a full DTO (includes StorageAreaId for internal use).
        public static DockStorageAreaConnectionFullDTO MapToFullDto(DockStorageAreaConnection storageAreaConnection)
        {
            if (storageAreaConnection == null)
                throw new ArgumentNullException(nameof(storageAreaConnection));

            return new DockStorageAreaConnectionFullDTO
            {
                DockId = storageAreaConnection.DockId,
                StorageAreaId = storageAreaConnection.StorageAreaId,
                DistanceMeters = storageAreaConnection.DistanceMeters,
                TravelSeconds = storageAreaConnection.TravelSeconds
            };
        }

        // Converts a DockStorageAreaConnectionDTO with StorageAreaId parameter to domain entity.
        public static DockStorageAreaConnection MapToDomain(DockStorageAreaConnectionDTO dto, int storageAreaId)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (storageAreaId <= 0)
                throw new ArgumentException("StorageAreaId must be positive", nameof(storageAreaId));

            return new DockStorageAreaConnection(
                dockId: dto.DockId,
                storageAreaId: storageAreaId,
                distanceMeters: dto.DistanceMeters,
                travelSeconds: dto.TravelSeconds
            );
        }

        // Converts a full DTO back to the domain entity.
        public static DockStorageAreaConnection MapToFullDomain(DockStorageAreaConnectionFullDTO fullDto)
        {
            if (fullDto == null)
                throw new ArgumentNullException(nameof(fullDto));

            return new DockStorageAreaConnection(
                dockId: fullDto.DockId,
                storageAreaId: fullDto.StorageAreaId,
                distanceMeters: fullDto.DistanceMeters,
                travelSeconds: fullDto.TravelSeconds
            );
        }

        // Updates an existing DockStorageAreaConnection entity with values from a DTO.
        public static void UpdateFromDto(DockStorageAreaConnection existingConnection, DockStorageAreaConnectionDTO dto)
        {
            if (existingConnection == null)
                throw new ArgumentNullException(nameof(existingConnection));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            existingConnection.DistanceMeters = dto.DistanceMeters;
            existingConnection.TravelSeconds = dto.TravelSeconds;
            // Note: DockId and StorageAreaId should not be updated as they are part of the entity identity
        }
    };
}