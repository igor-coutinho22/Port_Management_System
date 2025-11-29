using System;
using System.Collections.Generic;
using System.Linq;
using WebApp.Models.Domain.Agents;
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
        public Guid ShippingAgentOrganizationId { get; private set; } = default!;
        public ShippingAgentOrganization ShippingAgentOrganization { get; private set; } = default!;

        public DateTime VisitDate { get; private set; }
        public Guid DockId { get; private set; }
        public VesselVisitStatus Status { get; private set; }
        public VisitPurpose Purpose { get; private set; }

        // Each VVN may have 0, 1, or 2 manifests
        public CargoManifest? LoadingManifest { get; private set; }
        public CargoManifest? UnloadingManifest { get; private set; }

        public List<CrewMember> Crew { get; private set; } = new();

        public DateTime ArrivalTime { get; private set; }
        public DateTime DesiredDepartureTime { get; private set; }

        // Estimated loading duration in minutes for this visit (if any).
        public int EstimatedLoadingDurationMinutes { get; private set; }

        // Estimated unloading duration in minutes for this visit (if any).
        public int EstimatedUnloadingDurationMinutes { get; private set; }


        private VesselVisitNotification() { }

        public VesselVisitNotification(Guid shippingAgentOrganizationId, string vesselIMO, Guid dockId, DateTime visitDate, VisitPurpose purpose, DateTime arrivalTime, DateTime desiredDepartureTime, int estimatedLoadingDurationMinutes, int estimatedUnloadingDurationMinutes)
        {
            Id = Guid.NewGuid();
            ShippingAgentOrganizationId = shippingAgentOrganizationId;
            VesselIMO = vesselIMO;
            DockId = dockId;
            CheckDateNotInPast(visitDate);
            VisitDate = DateTime.SpecifyKind(visitDate, DateTimeKind.Utc);
            Purpose = purpose;
            Status = VesselVisitStatus.InProgress;
            CheckDateNotInPast(arrivalTime);
            ArrivalTime = DateTime.SpecifyKind(arrivalTime, DateTimeKind.Utc);
            CheckDepartureTimeIsAfterArrival(desiredDepartureTime);
            DesiredDepartureTime = DateTime.SpecifyKind(desiredDepartureTime, DateTimeKind.Utc);
            CheckDurationIsNonNegative(estimatedLoadingDurationMinutes, "EstimatedLoadingDurationMinutes");
            CheckDurationIsNonNegative(estimatedUnloadingDurationMinutes, "EstimatedUnloadingDurationMinutes");
            EstimatedLoadingDurationMinutes = estimatedLoadingDurationMinutes;
            EstimatedUnloadingDurationMinutes = estimatedUnloadingDurationMinutes;
        }

        public void Update(Guid dockId, DateTime visitDate, VisitPurpose purpose, DateTime arrivalTime, DateTime desiredDepartureTime, int estimatedLoadingDurationMinutes, int estimatedUnloadingDurationMinutes)
        {
            DockId = dockId;
            CheckDateNotInPast(visitDate);
            VisitDate = DateTime.SpecifyKind(visitDate, DateTimeKind.Utc);
            Purpose = purpose;
            CheckDateNotInPast(arrivalTime);
            ArrivalTime = DateTime.SpecifyKind(arrivalTime, DateTimeKind.Utc);
            CheckDepartureTimeIsAfterArrival(desiredDepartureTime);
            DesiredDepartureTime = DateTime.SpecifyKind(desiredDepartureTime, DateTimeKind.Utc);
            CheckDurationIsNonNegative(estimatedLoadingDurationMinutes, "EstimatedLoadingDurationMinutes");
            CheckDurationIsNonNegative(estimatedUnloadingDurationMinutes, "EstimatedUnloadingDurationMinutes");
            EstimatedLoadingDurationMinutes = estimatedLoadingDurationMinutes;
            EstimatedUnloadingDurationMinutes = estimatedUnloadingDurationMinutes;
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

        public void AddCrewMember(CrewMember member)
        {
            if (Crew.Any(cm => cm.CitizenId == member.CitizenId))
                throw new InvalidOperationException("Crew member with the same Citizen ID already exists.");

            Crew.Add(member);
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

        public DecisionLog Approve()
        {
            if (Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only submitted visits can be approved.");

            if (Crew == null || !Crew.Any())
                throw new InvalidOperationException("Cannot approve a visit without crew information.");

            Status = VesselVisitStatus.Approved;
            var log = new DecisionLog(DecisionOutcome.Approved, $"Approved with valid crew data and dock assigned. (Crew verified: {Crew.Count}).");
            DecisionLogs.Add(log);
            return log;
        }

        public DecisionLog Reject(string reason)
        {
            if (Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only submitted visits can be rejected.");

            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("A rejection reason is required.");

            Status = VesselVisitStatus.Rejected;
            var log = new DecisionLog(DecisionOutcome.Rejected, reason);
            DecisionLogs.Add(log);
            return log;
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

        private void CheckDateNotInPast(DateTime date)
        {
            if (date < DateTime.UtcNow.Date)
                throw new ArgumentException("Visit date cannot be in the past.");
        }

        private void CheckDepartureTimeIsAfterArrival(DateTime date)
        {
            if (date <= ArrivalTime)
                throw new ArgumentException("Desired departure time must be after arrival time.");
        }

        private void CheckDurationIsNonNegative(int? duration, string fieldName)
        {
            if (duration.HasValue && duration.Value < 0)
                throw new ArgumentException($"{fieldName} cannot be negative.", fieldName);
        }

        public void UpdateScheduleWindow(DateTime arrivalTime, DateTime desiredDepartureTime)
        {
            EnsureInProgress();

            if (desiredDepartureTime <= arrivalTime)
                throw new ArgumentException("Desired departure time must be after arrival time.");

            CheckDateNotInPast(arrivalTime);

            ArrivalTime = DateTime.SpecifyKind(arrivalTime, DateTimeKind.Utc);
            DesiredDepartureTime = DateTime.SpecifyKind(desiredDepartureTime, DateTimeKind.Utc);
        }
        public void UpdateEstimatedDurations(int loadingMinutes, int unloadingMinutes)
        {
            EnsureInProgress();

            if (loadingMinutes < 0)
                throw new ArgumentException("Loading duration cannot be negative.", nameof(loadingMinutes));

            if (unloadingMinutes < 0)
                throw new ArgumentException("Unloading duration cannot be negative.", nameof(unloadingMinutes));

            EstimatedLoadingDurationMinutes = loadingMinutes;
            EstimatedUnloadingDurationMinutes = unloadingMinutes;
        }

    }
}
