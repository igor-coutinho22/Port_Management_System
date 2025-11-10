using System;
using System.Collections.Generic;
using System.Linq;
using WebApp.Models.Domain.Vessels;

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
        public string VesselIMO { get; private set; } = default!;
        public Vessel Vessel { get; private set; } = default!;

        public DateTime VisitDate { get; private set; }
        public Guid DockId { get; private set; }
        public VesselVisitStatus Status { get; private set; }
        public VisitPurpose Purpose { get; private set; }

        // Each VVN may have 0, 1, or 2 manifests
        public CargoManifest? LoadingManifest { get; private set; }
        public CargoManifest? UnloadingManifest { get; private set; }

        public List<CrewMember> Crew { get; private set; } = new();

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

        public void UpdatePurpose(VisitPurpose newPurpose)
        {
            EnsureInProgress();
            Purpose = newPurpose;
        }

        public void UpdateDockId(Guid newDockId)
        {
            EnsureInProgress();
            DockId = newDockId;
        }

        public void UpdateVisitDate(DateTime newDate)
        {
            EnsureInProgress();
            VisitDate = newDate;
        }

        public void UpdateLoadingManifest(CargoManifest? manifest)
        {
            EnsureInProgress();

            if (manifest == null)
            {
                LoadingManifest = null;
                return;
            }

            if (manifest.Type != CargoManifestType.Loading)
                throw new InvalidOperationException("Loading manifest must be of type 'Loading'.");

            LoadingManifest = manifest;
        }

        public void UpdateUnloadingManifest(CargoManifest? manifest)
        {
            EnsureInProgress();

            if (manifest == null)
            {
                UnloadingManifest = null;
                return;
            }

            if (manifest.Type != CargoManifestType.Unloading)
                throw new InvalidOperationException("Unloading manifest must be of type 'Unloading'.");

            UnloadingManifest = manifest;
        }

        public void UpdateCrew(IEnumerable<CrewMember> crew)
        {
            EnsureInProgress();
            Crew = crew?.ToList() ?? new List<CrewMember>();
        }

        private void EnsureInProgress()
        {
            if (Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");
        }
    }
}
