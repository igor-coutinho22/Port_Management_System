using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Domain.Docks
{
    public class Dock
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Location { get; private set; } = string.Empty;
        public double LengthMeters { get; private set; }
        public double DepthMeters { get; private set; }
        public double MaxDraftMeters { get; private set; }

        public List<VesselType> AllowedVesselTypes { get; private set; } = new();

        private Dock() { } // EF Core

        public Dock(string name, string location, double length, double depth, double maxDraft)
        {
            Id = Guid.NewGuid();
            Name = name;
            Location = location;
            LengthMeters = length;
            DepthMeters = depth;
            MaxDraftMeters = maxDraft;
        }

        public void Update(string name, string location, double length, double depth, double maxDraft)
        {
            Name = name;
            Location = location;
            LengthMeters = length;
            DepthMeters = depth;
            MaxDraftMeters = maxDraft;
        }

        public void AllowVesselType(VesselType vesselType)
        {
            if (!AllowedVesselTypes.Any(v => v.Name == vesselType.Name))
                AllowedVesselTypes.Add(vesselType);
        }

        public void RemoveVesselType(string vesselTypeName)
        {
            var type = AllowedVesselTypes.FirstOrDefault(v => v.Name == vesselTypeName);
            if (type != null)
                AllowedVesselTypes.Remove(type);
        }
    }
}