// File: WebApp/Models/Application/DTOs/RepresentativeDtos.cs
namespace WebApp.Models.Application.DTOs
{
    public record RepresentativeDto(
        Guid Id,
        Guid OrganizationId,
        string Name,
        string CitizenId,
        string Nationality,
        string Email,
        string Phone,
        bool IsActive
    );

    public class CreateRepresentativeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class UpdateRepresentativeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}