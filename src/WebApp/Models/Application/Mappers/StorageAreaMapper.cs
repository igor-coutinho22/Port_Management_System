using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.Mappers
{
    public static class StorageAreaMapper
    {
        public static StorageAreaDTO MapToDto(StorageArea storageArea)
        {
            if (storageArea == null)
                throw new ArgumentNullException(nameof(storageArea));

            return new StorageAreaDTO
            {
                Id = storageArea.Id,
                Name = storageArea.Name,
                Type = storageArea.Type,
                MaxCapacityTeu = storageArea.MaxCapacityTeu,
                CurrentOccupancyTeu = storageArea.CurrentOccupancyTeu,
                DockConnections = storageArea.DockConnections.Select(dc => new DockStorageAreaConnectionDTO
                {
                    DockId = dc.DockId,
                    DistanceMeters = dc.DistanceMeters,
                    TravelSeconds = dc.TravelSeconds
                }).ToList()
            };
        }
    }
}
