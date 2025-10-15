namespace WebApp.Models.Domain.Vessels.VesselType
{
    public class VesselType
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int MaxBays { get; set; }
        public int MaxRows { get; set; }
        public int MaxTiers { get; set; }
        public int MaxTEUCapacity => MaxRows * MaxBays * MaxTiers;

        private VesselType(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            Name = name;
            Description = description;
            MaxBays = maxBays;
            MaxRows = maxRows;
            MaxTiers = maxTiers;
        }

        public static readonly VesselType Feeder =
            new VesselType(
                "Feeder",
                "Feeder vessels are smaller container ships that typically operate on regional routes, transporting containers to and from larger hub ports. They usually have a capacity ranging from 100 to 3,000 TEUs (Twenty-Foot Equivalent Units). Feeder vessels are designed to navigate shallower waters and smaller ports that larger vessels cannot access.",
                maxBays: 8,
                maxRows: 8,
                maxTiers: 4
        );

        public static readonly VesselType Panamax =
            new VesselType(
                "Panamax",
                "Panamax vessels are designed to fit through the original locks of the Panama Canal. They typically have a maximum length of about 294 meters (965 feet), a beam (width) of 32.3 meters (106 feet), and a draft (depth) of 12.04 meters (39.5 feet). Panamax vessels can carry around 4,500 to 5,000 TEUs (Twenty-Foot Equivalent Units).",
                maxBays: 12,
                maxRows: 10,
                maxTiers: 6
        );

        public static readonly VesselType PostPanamax =
            new VesselType(
                "Post-Panamax",
                "Post-Panamax vessels are larger than Panamax vessels and are designed to exceed the size limitations of the original Panama Canal locks. They typically have a maximum length of about 366 meters (1,200 feet), a beam (width) of 49 meters (160 feet), and a draft (depth) of 15.2 meters (50 feet). Post-Panamax vessels can carry around 10,000 to 13,000 TEUs (Twenty-Foot Equivalent Units).",
                maxBays: 14,
                maxRows: 12,
                maxTiers: 7
        );

        public static readonly VesselType ULCVessel =
            new VesselType(
                "Ultra Large Container Vessel (ULCV)",
                "Ultra Large Container Vessels (ULCVs) are among the largest container ships in the world, designed to maximize cargo capacity for long-haul routes. They typically have a maximum length of about 400 meters (1,312 feet), a beam (width) of 59 meters (194 feet), and a draft (depth) of 16 meters (52 feet). ULCVs can carry over 20,000 TEUs (Twenty-Foot Equivalent Units), making them highly efficient for transporting large volumes of goods across oceans.",
                maxBays: 24,
                maxRows: 20,
                maxTiers: 10
        );

        public static IEnumerable<VesselType> GetAllTypes()
        {
            return new[] { Feeder, Panamax, PostPanamax, ULCVessel };
        }
    }
}
