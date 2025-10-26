namespace WebApp.Models.Application.Mappers
{
    using WebApp.Models.Application.DTOs;
    using WebApp.Models.Domain.StorageArea;

    public static class StorageAreaMapper
    {
        // Converts a domain StorageArea entity to a DTO.
        public static StorageAreaDTO MapToDto(StorageArea storageArea)
        {
            if (storageArea == null)
                throw new ArgumentNullException(nameof(storageArea));

            return new StorageAreaDTO
            {
                Name = storageArea.Name,
                Type = storageArea.Type,
                MaxCapacityTeu = storageArea.MaxCapacityTeu,
                CurrentOccupancyTeu = storageArea.CurrentOccupancyTeu
            };
        }
    }
}