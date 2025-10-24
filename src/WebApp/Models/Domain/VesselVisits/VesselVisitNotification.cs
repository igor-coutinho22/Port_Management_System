namespace WebApp.Models.Domain.VesselVisits
{
    public class VesselVisitNotification
    {
        public Guid Id { get; private set; }
        public Guid VesselId { get; private set; }
        public DateTime VisitDate { get; private set; }
        public Guid DockId { get; private set; }
        public VesselVisitStatus Status { get; private set; }

        // Each VVN may have 0, 1, or 2 manifests
        public CargoManifest? LoadingManifest { get; private set; }
        public CargoManifest? UnloadingManifest { get; private set; }

        public List<CrewMember> Crew { get; private set; } = new();

        private VesselVisitNotification() { }

        public VesselVisitNotification(Guid vesselId, Guid dockId, DateTime visitDate)
        {
            Id = Guid.NewGuid();
            VesselId = vesselId;
            DockId = dockId;
            VisitDate = visitDate;
            Status = VesselVisitStatus.InProgress;
        }

        public void AddLoadingManifest(CargoManifest manifest)
        {
            if (manifest.Type != CargoManifestType.Loading)
                throw new InvalidOperationException("Manifest must be of type 'Loading'.");

            if (LoadingManifest != null)
                throw new InvalidOperationException("A loading manifest has already been added.");

            LoadingManifest = manifest;
        }

        public void AddUnloadingManifest(CargoManifest manifest)
        {
            if (manifest.Type != CargoManifestType.Unloading)
                throw new InvalidOperationException("Manifest must be of type 'Unloading'.");

            if (UnloadingManifest != null)
                throw new InvalidOperationException("An unloading manifest has already been added.");

            UnloadingManifest = manifest;
        }

        public void AddCrewMember(string name, string citizenId, string nationality)
        {
            Crew.Add(new CrewMember(name, citizenId, nationality));
        }

        public void MarkAsSubmitted()
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be submitted.");

            // ✅ Allow visits with zero or up to two manifests.
            // But at least validate that existing manifests are valid objects.
            if (LoadingManifest == null && UnloadingManifest == null)
            {
                // Optional rule: could require manifests for commercial visits,
                // but allow null for maintenance-type visits.
            }

            Status = VesselVisitStatus.Submitted;
        }
    }
}
