using System;
namespace WebApp.Models.Domain.StorageArea
{
    // Persistent join entity: represents distance/time between a Dock and a StorageArea
    public class DockStorageAreaInfo
    {
        public int Id { get; set; }

        // Foreign keys
        public int DockId { get; set; }
        public int StorageAreaId { get; set; }

        // Value fields
        public double DistanceMeters { get; set; }
        public int TravelSeconds { get; set; }
    }
}
