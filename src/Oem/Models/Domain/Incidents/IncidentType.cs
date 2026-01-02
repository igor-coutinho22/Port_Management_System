using System;
using System.ComponentModel.DataAnnotations;

namespace Oem.Models.Domain.Incidents
{
    public class IncidentType
    {
        public Guid Id { get; private set; }

        [Required]
        public string Code { get; private set; } = string.Empty;

        [Required]
        public string Name { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;

        public string Severity { get; private set; } = "Minor"; // Minor, Major, Critical

        public Guid? ParentTypeId { get; private set; }

        protected IncidentType() { }

        public IncidentType(string code, string name, string description, string severity, Guid? parentTypeId = null)
        {
            if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required.");
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.");

            Id = Guid.NewGuid();
            Code = code;
            Name = name;
            Description = description;
            Severity = severity ?? "Minor";
            ParentTypeId = parentTypeId;
        }

        public void Update(string name, string description, string severity, Guid? parentTypeId)
        {
            if (!string.IsNullOrWhiteSpace(name)) Name = name;
            Description = description; // Allow clearing? Assuming yes or just update
            if (!string.IsNullOrWhiteSpace(severity)) Severity = severity;
            ParentTypeId = parentTypeId;
        }
    }
}
