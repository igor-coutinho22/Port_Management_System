using PortManagement.Domain.Enums;

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
    }
}