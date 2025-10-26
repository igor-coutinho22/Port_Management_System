using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Domain.Docks
{
    public class Dock
    {
        public Guid Id { get; private set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double LengthMeters { get; protected set; }
        public double DepthMeters { get; protected set; }
        public double MaxDraftMeters { get; protected set; }

        public List<VesselType> AllowedVesselTypes { get; set; } = new();

        private Dock() { } // EF Core

        public Dock(string name, string location, double length, double depth, double maxDraft, List<VesselType> allowedVesselTypes)
        {
            Id = Guid.NewGuid();
            Name = name;
            Location = location;
            LengthMeters = length;
            DepthMeters = depth;
            MaxDraftMeters = maxDraft;
            AllowedVesselTypes = allowedVesselTypes;
        }

        public void Update(string name, string location, double length, double depth, double maxDraft, List<VesselType> allowedVesselTypes)
        {
            Name = name;
            Location = location;
            LengthMeters = length;
            DepthMeters = depth;
            MaxDraftMeters = maxDraft;
            AllowedVesselTypes = allowedVesselTypes;
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

        public void UpdateAllowedVesselTypes(List<VesselType> vesselTypes)
        {
            AllowedVesselTypes = vesselTypes;
        }

        public void UpdateLength(double length)
        {
            LengthMeters = length;
        }

        public void UpdateDepth(double depth)
        {
            DepthMeters = depth;
        }

        public void UpdateMaxDraft(double maxDraft)
        {
            MaxDraftMeters = maxDraft;
        }
    }
}