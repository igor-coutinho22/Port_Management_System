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
    }
}