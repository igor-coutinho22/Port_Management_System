using System;
using System.Collections.Generic;
using Oem.Models.Domain.Incidents;

namespace Oem.Models.Application.DTOs
{
    public class CreateIncidentDTO
    {
        public Guid IncidentTypeId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public string Severity { get; set; } = "Minor";
        public string Author { get; set; } = "System"; // Can be populated from Token
        public IncidentScope Scope { get; set; }
        public List<Guid>? AffectedVesselVisitIds { get; set; }
    }

    public class UpdateIncidentDTO
    {
        public string Description { get; set; }
        public string Severity { get; set; }
        public List<Guid>? AffectedVesselVisitIds { get; set; }
    }

    public class IncidentDTO
    {
        public Guid Id { get; set; }
        public Guid IncidentTypeId { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; }
        public string Severity { get; set; }
        public string CreatedBy { get; set; }
        public string Scope { get; set; }
        public List<Guid> AffectedVesselVisitIds { get; set; }
    }
}
