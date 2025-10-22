using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using PortManagement.Domain.Enums;

namespace WebApp.Models.Domain.StorageArea
{
    public abstract class StorageArea
    {
        public int Id { get; protected set; }

        // Used for location/description
        public string Name { get; set; } = null!;
        public StorageAreaType Type { get; protected set; }

        public int MaxCapacityTeu { get; protected set; }
        public int CurrentOccupancyTeu { get; protected set; }

    // Persistent navigation collection for connections to docks (stored in DB)
    // Each entry is a DockStorageAreaInfo row that links this StorageArea with a DockId
    public virtual ICollection<DockStorageAreaInfo> DockConnections { get; protected set; } = new List<DockStorageAreaInfo>();

        // EF Core needs a parameterless constructor (can be protected)
        protected StorageArea() { }

        // Domain constructor enforcing invariants
        protected StorageArea(StorageAreaType type, string name, int maxCapacityTeu, int currentOccupancyTeu)
        {

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));
            if (maxCapacityTeu < 0)
                throw new ArgumentOutOfRangeException(nameof(maxCapacityTeu), "Max capacity must be >= 0.");
            if (currentOccupancyTeu < 0)
                throw new ArgumentOutOfRangeException(nameof(currentOccupancyTeu), "Current occupancy must be >= 0.");
            if (currentOccupancyTeu > maxCapacityTeu)
                throw new ArgumentException("Current occupancy cannot exceed max capacity.", nameof(currentOccupancyTeu));

            Type = type;
            Name = name;
            MaxCapacityTeu = maxCapacityTeu;
            CurrentOccupancyTeu = currentOccupancyTeu;

            // persistent connections are handled via DockConnections collection
        }

        // Method to check if adding more TEUs would exceed capacity
        public bool CanAddTeus(int teusToAdd)
        {
            return (CurrentOccupancyTeu + teusToAdd) <= MaxCapacityTeu;
        }

        public void ChangeMaxCapacity(int newMaxCapacityTeu)
        {
            if (newMaxCapacityTeu < CurrentOccupancyTeu)
                throw new ArgumentException("New max capacity cannot be less than current occupancy.", nameof(newMaxCapacityTeu));

            MaxCapacityTeu = newMaxCapacityTeu;
        }

        public void UpdateCurrentOccupancy(int newOccupancyTeu)
        {
            if (newOccupancyTeu < 0 || newOccupancyTeu > MaxCapacityTeu)
                throw new ArgumentOutOfRangeException(nameof(newOccupancyTeu), "New occupancy must be between 0 and max capacity.");

            CurrentOccupancyTeu = newOccupancyTeu;
        }

        // Method for registering/updating
        public abstract string GetUsageDescription();

        /// <summary>
        /// Get the connection info for a given dock id, or null if none exists.
        /// This reads from the persistent navigation collection <see cref="DockConnections"/>.
        /// </summary>
        public DockStorageAreaInfo? GetInfoForDock(int dockId)
        {
            return DockConnections?.FirstOrDefault(c => c.DockId == dockId);
        }

        /// <summary>
        /// Add or update a connection entry in the in-memory navigation collection.
        /// Repository code should persist the change (SaveChangesAsync) afterwards.
        /// </summary>
        public void SetInfoForDock(int dockId, DockStorageAreaInfo info)
        {
            if (info == null) throw new ArgumentNullException(nameof(info));

            var conn = DockConnections.FirstOrDefault(c => c.DockId == dockId);
            if (conn != null)
            {
                conn.DistanceMeters = info.DistanceMeters;
                conn.TravelSeconds = info.TravelSeconds;
            }
            else
            {
                // ensure FK fields are set
                info.StorageAreaId = this.Id;
                info.DockId = dockId;
                DockConnections.Add(info);
            }
        }

        /// <summary>
        /// Remove any connection associated with the dock id from the navigation collection.
        /// Repository should persist the removal.
        /// </summary>
        public bool RemoveInfoForDock(int dockId)
        {
            var conn = DockConnections.FirstOrDefault(c => c.DockId == dockId);
            if (conn == null) return false;
            return DockConnections.Remove(conn);
        }
    }
}