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
        // Each entry is a DockStorageAreaConnection row that links this StorageArea with a DockId
        public virtual ICollection<DockStorageAreaConnection> DockConnections { get; protected set; } = new List<DockStorageAreaConnection>();

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

        public void AddDockConnection(DockStorageAreaConnection connection)
        {
            if (connection == null)
                throw new ArgumentNullException(nameof(connection));

            if (DockConnections.Any(dc => dc.DockId == connection.DockId))
                throw new InvalidOperationException("Connection to this dock already exists.");

            DockConnections.Add(connection);
        }

        public void UpdateDockConnection(DockStorageAreaConnection connection)
        {
            if (connection == null)
                throw new ArgumentNullException(nameof(connection));

            var existingConnection = DockConnections.FirstOrDefault(dc => dc.DockId == connection.DockId);
            if (existingConnection == null)
                throw new InvalidOperationException("Connection to this dock does not exist.");

            existingConnection.DistanceMeters = connection.DistanceMeters;
            existingConnection.TravelSeconds = connection.TravelSeconds;
        }

        public void RemoveDockConnection(DockStorageAreaConnection connection)
        {
            if (connection == null)
                throw new ArgumentNullException(nameof(connection));

            if (!DockConnections.Remove(connection))
                throw new InvalidOperationException("Connection to this dock does not exist.");
        }

        // Method for registering/updating
        public abstract string GetUsageDescription();
    }
}