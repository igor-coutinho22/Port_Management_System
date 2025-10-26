namespace WebApp.Models.Domain.VesselVisits
{
    public enum VisitPurpose
    {
        Commercial,
        Maintenance
    }

    public class VesselVisitNotification
    {
        public Guid Id { get; private set; }
        public string? VesselIMO { get; protected set; }
        public DateTime VisitDate { get; protected set; }
        public Guid DockId { get; protected set; }
        public VesselVisitStatus Status { get; protected set; }
        public VisitPurpose Purpose { get; protected set; }

        // Each VVN may have 0, 1, or 2 manifests
        public CargoManifest? LoadingManifest { get; protected set; }
        public CargoManifest? UnloadingManifest { get; protected set; }

        public List<CrewMember> Crew { get; protected set; } = new();

        private VesselVisitNotification() { }

        public VesselVisitNotification(string vesselIMO, Guid dockId, DateTime visitDate, VisitPurpose purpose)
        {
            Id = Guid.NewGuid();
            VesselIMO = vesselIMO;
            DockId = dockId;
            VisitDate = visitDate;
            Purpose = purpose;
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
            // For commercial visits, at least one manifest must exist.
            if (Purpose == VisitPurpose.Commercial &&
                LoadingManifest == null && UnloadingManifest == null)
            {
                throw new InvalidOperationException(
                    "Commercial visits must include at least one cargo manifest."
                );
            }

            Status = VesselVisitStatus.Submitted;
        }
    
        public void Approve(Guid officerId, Guid dockId)
        {
            if (Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only submitted visits can be approved.");

            if (dockId == Guid.Empty)
                throw new ArgumentException("A valid dock must be assigned upon approval.");

            if (Crew == null || !Crew.Any())
                throw new InvalidOperationException("Cannot approve a visit without crew information.");

            DockId = dockId;
            Status = VesselVisitStatus.Approved;

        LogDecision(officerId, DecisionOutcome.Approved, "Approved with valid crew data and dock assigned.");
        }
        public void Reject(Guid officerId, string reason)
        {
            if (Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only submitted visits can be rejected.");

            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("A rejection reason is required.");

            Status = VesselVisitStatus.Rejected;

            LogDecision(officerId, DecisionOutcome.Rejected, reason);
        }

        private void LogDecision(Guid officerId, DecisionOutcome outcome, string message)
        {
            var details = $"{message} (Crew verified: {Crew.Count}).";
            DecisionLogs.Add(new DecisionLog(officerId, outcome, details));
        }


        public List<DecisionLog> DecisionLogs { get; private set; } = new();

        public void UpdateVisitDate(DateTime newDate)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            if (newDate < DateTime.UtcNow)
                throw new ArgumentException("Visit date cannot be in the past.", nameof(newDate));

            VisitDate = newDate;
        }

        public void UpdateVesselIMO(string newIMO)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            if (string.IsNullOrWhiteSpace(newIMO))
                throw new ArgumentException("Vessel IMO cannot be empty.", nameof(newIMO));

            VesselIMO = newIMO;
        }

        public void UpdatePurpose(VisitPurpose newPurpose)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            Purpose = newPurpose;
        }

        public void UpdateDockId(Guid newDockId)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            if (newDockId == Guid.Empty)
                throw new ArgumentException("Dock ID cannot be empty.", nameof(newDockId));

            DockId = newDockId;
        }

        public void UpdateLoadingManifest(CargoManifest? newManifest)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            LoadingManifest = newManifest;
        }

        public void UpdateUnloadingManifest(CargoManifest? newManifest)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            UnloadingManifest = newManifest;
        }

        public void UpdateCrew(List<CrewMember> newCrew)
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            Crew = newCrew ?? new List<CrewMember>();
        }
    }
}
