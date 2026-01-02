using System;

namespace Oem.Models.Application.DTOs
{
    public class CreateIncidentTypeDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "Minor";
        public Guid? ParentTypeId { get; set; }
    }

    public class IncidentTypeDTO
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public Guid? ParentTypeId { get; set; }
    }
}
