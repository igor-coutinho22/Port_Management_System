using System.ComponentModel.DataAnnotations.Schema;
using PortManagement.Domain.Enums;
using WebApp.Models.Domain.Containers;

namespace WebApp.Models.Domain.StorageArea
{
    public abstract class StorageArea
    {
        public int Id { get; protected set; }

        public string Name { get; set; } = null!;
        public StorageAreaType Type { get; protected set; }

        public int MaxCapacityTeu { get; set; }

        // EF Core navigation
        public virtual ICollection<Container> ContainerList { get; protected set; } = new List<Container>();

        public virtual ICollection<DockStorageAreaConnection> DockConnections { get; protected set; } = new List<DockStorageAreaConnection>();

        protected StorageArea() { }

        protected StorageArea(StorageAreaType type, string name, int maxCapacityTeu)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));

            if (maxCapacityTeu < 0)
                throw new ArgumentOutOfRangeException(nameof(maxCapacityTeu));

            Type = type;
            Name = name;
            MaxCapacityTeu = maxCapacityTeu;
        }

        [NotMapped]
        public int CurrentOccupancyTeu => ContainerList.Sum(c => c.Teu);

        public bool CanAddTeus(int teusToAdd) =>
            CurrentOccupancyTeu + teusToAdd <= MaxCapacityTeu;

        public void AddContainer(Container container)
        {
            if (container == null)
                throw new ArgumentNullException(nameof(container));

            if (ContainerList.Any(c => c.Identifier == container.Identifier))
                throw new InvalidOperationException("Container already exists in this storage area.");

            if (!CanAddTeus(container.Teu))
                throw new InvalidOperationException("Adding this container would exceed max capacity.");

            ContainerList.Add(container);
        }

        public void RemoveContainer(string containerIdentifier)
        {
            var container = ContainerList
                .FirstOrDefault(c => c.Identifier == containerIdentifier);

            if (container == null)
                throw new InvalidOperationException("Container not found in this storage area.");

            ContainerList.Remove(container);
        }

        public bool ContainsContainer(string containerIdentifier) =>
            ContainerList.Any(c => c.Identifier == containerIdentifier);

        public void ChangeMaxCapacity(int newMaxCapacityTeu)
        {
            if (newMaxCapacityTeu < CurrentOccupancyTeu)
                throw new ArgumentException(
                    "New max capacity cannot be less than current occupancy.",
                    nameof(newMaxCapacityTeu));

            MaxCapacityTeu = newMaxCapacityTeu;
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

            var existing = DockConnections
                .FirstOrDefault(dc => dc.DockId == connection.DockId);

            if (existing == null)
                throw new InvalidOperationException("Connection to this dock does not exist.");

            existing.DistanceMeters = connection.DistanceMeters;
            existing.TravelSeconds = connection.TravelSeconds;
        }

        public void RemoveDockConnection(DockStorageAreaConnection connection)
        {
            if (connection == null)
                throw new ArgumentNullException(nameof(connection));

            if (!DockConnections.Remove(connection))
                throw new InvalidOperationException("Connection to this dock does not exist.");
        }

        public abstract string GetUsageDescription();
    }
}
