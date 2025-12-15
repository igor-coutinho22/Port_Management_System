public class CargoManifestDTO
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public List<ContainerDTO> Containers { get; set; } = new();
    }