namespace WebApp.Models.Domain.VesselVisits
{
    public class CargoManifest
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public CargoManifestType Type { get; private set; }
        public List<Container> Containers { get; private set; } = new();

        private CargoManifest() { }

        public CargoManifest(CargoManifestType type)
        {
            Type = type;
        }

        public void AddContainer(Container container)
        {
            Containers.Add(container);
        }

        public void RemoveContainer(Container container)
        {
            Containers.Remove(container);
        }

        public void UpdateContainers(List<Container> containers)
        {
            Containers = containers;
        }
    }
}
