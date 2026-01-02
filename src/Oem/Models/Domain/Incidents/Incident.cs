using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Oem.Models.Domain.Incidents
{
    public enum IncidentScope
    {
        Global = 0,
        Specific = 1
    }

    public enum IncidentStatus
    {
        Active = 0,
        Resolved = 1
    }

    public class Incident
    {
        public Guid Id { get; private set; }

        [Required]
        public Guid IncidentTypeId { get; private set; }

        public string Description { get; private set; } = string.Empty;

        public DateTime StartTime { get; private set; }
        public DateTime? EndTime { get; private set; }

        // Computed Duration?
        public TimeSpan? Duration => EndTime.HasValue ? EndTime.Value - StartTime : null;

        public IncidentStatus Status { get; private set; } = IncidentStatus.Active;

        public string Severity { get; private set; } = "Minor";

        public string CreatedBy { get; private set; } = string.Empty;

        public IncidentScope Scope { get; private set; } = IncidentScope.Specific;

        // Valid only if Scope == Specific
        public List<Guid> AffectedVesselVisitIds { get; private set; } = new List<Guid>();

        protected Incident() { }

        public Incident(Guid incidentTypeId, string description, DateTime startTime, string severity, string createdBy, IncidentScope scope, List<Guid>? affectedVves = null)
        {
            Id = Guid.NewGuid();
            IncidentTypeId = incidentTypeId;
            Description = description;
            StartTime = startTime;
            Severity = severity ?? "Minor";
            CreatedBy = createdBy;
            Scope = scope;
            
            if (scope == IncidentScope.Specific && affectedVves != null)
            {
                AffectedVesselVisitIds = affectedVves;
            }
        }

        public void Resolve(DateTime endTime)
        {
            if (endTime < StartTime) throw new ArgumentException("End time cannot be before start time.");
            EndTime = endTime;
            Status = IncidentStatus.Resolved;
        }

        public void Update(string description, string severity, List<Guid>? affectedVves)
        {
            Description = description;
            Severity = severity;
            if (affectedVves != null)
            {
                AffectedVesselVisitIds = affectedVves;
            }
        }
    }
}
