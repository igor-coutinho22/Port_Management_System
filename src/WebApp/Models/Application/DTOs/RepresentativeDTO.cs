namespace WebApp.Models.Application.DTOs
{
    public class RepresentativeDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string? Name { get; set; }
        public string? CitizenId { get; set; }
        public string? Nationality { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
    };

    public class CreateRepresentativeDto
    {
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class GetRepresentativeToAddDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class UpdateRepresentativeDto
    {
        public string Nationality { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}