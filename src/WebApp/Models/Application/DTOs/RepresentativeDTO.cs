using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Application.DTOs
{
    public class CreateRepresentativeRequest
    {
        public CreateRepresentativeRequest() { }

        public CreateRepresentativeRequest(
            string name,
            string citizenId,
            string nationality,
            string email,
            string phone)
        {
            Name = name;
            CitizenId = citizenId;
            Nationality = nationality;
            Email = email;
            Phone = phone;
        }

        [Required, MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        [RegularExpression(@"^[A-Z0-9]{3,30}$",
            ErrorMessage = "CitizenId must contain only alphanumeric characters (3–30).")]
        public string CitizenId { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string Nationality { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required, Phone, MaxLength(32)]
        [RegularExpression(@"^\+?[0-9]{6,15}$",
            ErrorMessage = "Phone must follow E.164 format (e.g. +351912345678).")]
        public string Phone { get; set; } = string.Empty;
    }

    public class UpdateRepresentativeRequest
    {
        public UpdateRepresentativeRequest() { }

        public UpdateRepresentativeRequest(
            string name,
            string citizenId,
            string nationality,
            string email,
            string phone)
        {
            Name = name;
            CitizenId = citizenId;
            Nationality = nationality;
            Email = email;
            Phone = phone;
        }

        [Required, MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        [RegularExpression(@"^[A-Z0-9]{3,30}$",
            ErrorMessage = "CitizenId must contain only alphanumeric characters (3–30).")]
        public string CitizenId { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string Nationality { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required, Phone, MaxLength(32)]
        [RegularExpression(@"^\+?[0-9]{6,15}$",
            ErrorMessage = "Phone must follow E.164 format (e.g. +351912345678).")]
        public string Phone { get; set; } = string.Empty;
    }

    public class RepresentativeDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
