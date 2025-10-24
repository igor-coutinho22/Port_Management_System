using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Application.DTOs
{
    public record CreateRepresentativeRequest(
        [Required, MaxLength(120)] string Name,
        [Required, MaxLength(30), RegularExpression(@"^[A-Z0-9]{3,30}$",
            ErrorMessage = "CitizenId must contain only alphanumeric characters (3–30).")]
        string CitizenId,
        [Required, MaxLength(80)] string Nationality,
        [Required, EmailAddress, MaxLength(254)] string Email,
        [Required, Phone, MaxLength(32),
            RegularExpression(@"^\+?[0-9]{6,15}$",
            ErrorMessage = "Phone must follow E.164 format (e.g. +351912345678).")]
        string Phone
    );

    public record UpdateRepresentativeRequest(
        [Required, MaxLength(120)] string Name,
        [Required, MaxLength(30), RegularExpression(@"^[A-Z0-9]{3,30}$",
            ErrorMessage = "CitizenId must contain only alphanumeric characters (3–30).")]
        string CitizenId,
        [Required, MaxLength(80)] string Nationality,
        [Required, EmailAddress, MaxLength(254)] string Email,
        [Required, Phone, MaxLength(32),
            RegularExpression(@"^\+?[0-9]{6,15}$",
            ErrorMessage = "Phone must follow E.164 format (e.g. +351912345678).")]
        string Phone
    );

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
}
