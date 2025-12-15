using PortManagement.Domain.Enums;
using WebApp.Models.Domain.Docks;

namespace WebApp.Models.Domain.StorageArea
{
    public class ContainerYard : StorageArea
    {
        public virtual ICollection<Dock> DocksServed { get; set; } = new List<Dock>();

        protected ContainerYard()
        {
            Type = StorageAreaType.ContainerYard;
        }

        public ContainerYard(string name, int maxCapacityTeu, ICollection<Dock> docksServed)
            : base(StorageAreaType.ContainerYard, name, maxCapacityTeu)
        {
            DocksServed = docksServed ?? throw new ArgumentNullException(nameof(docksServed));
        }

        /// <summary>
        /// Creates a ContainerYard for updates without generating a new ID.
        /// Prefer updating tracked entities instead of creating new instances.
        /// </summary>
        public static ContainerYard CreateForUpdate(int id, string name, int maxCapacityTeu, ICollection<Dock> docksServed)
        {
            if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name cannot be empty.", nameof(name));
            if (maxCapacityTeu < 0) throw new ArgumentOutOfRangeException(nameof(maxCapacityTeu));

            var yard = new ContainerYard
            {
                Name = name,
                MaxCapacityTeu = maxCapacityTeu,
                DocksServed = docksServed ?? new List<Dock>()
            };

            yard.Id = id;
            return yard;
        }

        public override string GetUsageDescription()
            => "Container Yard for temporary storage of containers (TEUs).";

        public void AddDocksToDocksServed(ICollection<Dock> docksToAdd)
        {
            if (docksToAdd == null || docksToAdd.Count == 0)
                throw new ArgumentException("Docks to add cannot be null or empty.", nameof(docksToAdd));

            foreach (var dock in docksToAdd)
                if (!DocksServed.Contains(dock))
                    DocksServed.Add(dock);
        }

        public void RemoveDocksFromDocksServed(ICollection<Dock> docksToRemove)
        {
            if (docksToRemove == null || docksToRemove.Count == 0)
                throw new ArgumentException("Docks to remove cannot be null or empty.", nameof(docksToRemove));

            foreach (var dock in docksToRemove)
                if (DocksServed.Contains(dock))
                    DocksServed.Remove(dock);
        }

        public void ClearDocksServed() => DocksServed.Clear();

        public void CreateConnectionsFromDocksServed()
        {
            if (Id <= 0)
                throw new InvalidOperationException("ContainerYard must be saved and have a valid ID before creating connections.");

            DockConnections.Clear();

            foreach (var dock in DocksServed)
            {
                var connection = new DockStorageAreaConnection(
                    dockId: dock.Id,
                    storageAreaId: Id,
                    distanceMeters: 0,
                    travelSeconds: 0
                );

                DockConnections.Add(connection);
            }
        }
    }
}
