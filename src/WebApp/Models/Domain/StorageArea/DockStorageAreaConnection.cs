using System;
namespace WebApp.Models.Domain.StorageArea
{
    // Persistent join entity: represents distance/time between a Dock and a StorageArea
    public class DockStorageAreaConnection
    {
        public int Id { get; set; }

        // Foreign keys
        public Guid DockId { get; set; }
        public int StorageAreaId { get; set; }

        // Value fields
        public double DistanceMeters { get; set; }
        public int TravelSeconds { get; set; }

        protected DockStorageAreaConnection()
        {
        }

        // Constructor for creating a new instance with all properties
        public DockStorageAreaConnection(Guid dockId, int storageAreaId, double distanceMeters, int travelSeconds)
        {
            DockId = dockId;
            StorageAreaId = storageAreaId;
            DistanceMeters = distanceMeters;
            TravelSeconds = travelSeconds;
        }
    }
}
