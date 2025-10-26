using PortManagement.Domain.Enums;
using WebApp.Models.Domain.Docks;

namespace WebApp.Models.Domain.StorageArea
{
    public class ContainerYard : StorageArea
    {
        public virtual ICollection<Dock> DocksServed { get; set; } = new List<Dock>();

        public ContainerYard()
        {
            Type = StorageAreaType.ContainerYard;
        }
        
        public ContainerYard(string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed)
            : base(StorageAreaType.ContainerYard, name, maxCapacityTeu, currentOccupancyTeu)
        {
            DocksServed = docksServed ?? throw new ArgumentNullException(nameof(docksServed));
        }

        /// <summary>
        /// Creates a ContainerYard for updates without generating a new ID.
        /// Use this method when you need a ContainerYard object for existing entities.
        /// </summary>
        public static ContainerYard CreateForUpdate(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed)
        {
            var yard = new ContainerYard
            {
                Name = name,
                MaxCapacityTeu = maxCapacityTeu,
                CurrentOccupancyTeu = currentOccupancyTeu,
                DocksServed = docksServed ?? new List<Dock>()
            };
            
            // Set the ID directly to avoid generating a new one
            yard.Id = id;
            return yard;
        }

        public override string GetUsageDescription()
        {
            return "Container Yard for temporary storage of containers (TEUs).";
        }

        public void addDocksToDocksServed(ICollection<Dock> docksToAdd)
        {
            if (docksToAdd == null || docksToAdd.Count == 0)
                throw new ArgumentException("Docks to add cannot be null or empty.", nameof(docksToAdd));

            foreach (var dock in docksToAdd)
            {
                if (!DocksServed.Contains(dock))
                {
                    DocksServed.Add(dock);
                }
            }
        }

        public void removeDocksFromDocksServed(ICollection<Dock> docksToRemove)
        {
            if (docksToRemove == null || docksToRemove.Count == 0)
                throw new ArgumentException("Docks to remove cannot be null or empty.", nameof(docksToRemove));

            foreach (var dock in docksToRemove)
            {
                if (DocksServed.Contains(dock))
                {
                    DocksServed.Remove(dock);
                }
            }
        }

        /// <summary>
        /// Creates DockConnections from the DocksServed collection. 
        /// Call this after the ContainerYard is saved and has a valid ID.
        /// </summary>
        public void CreateConnectionsFromDocksServed()
        {
            if (Id <= 0)
                throw new InvalidOperationException("ContainerYard must be saved and have a valid ID before creating connections.");

            DockConnections.Clear();
            foreach (var dock in DocksServed)
            {
                var connection = new DockStorageAreaConnection(
                    dockId: dock.Id,
                    storageAreaId: this.Id,
                    distanceMeters: 0, // Default value - can be updated later
                    travelSeconds: 0   // Default value - can be updated later
                );
                DockConnections.Add(connection);
            }
        }
    }
}