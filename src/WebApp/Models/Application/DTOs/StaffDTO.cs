using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Qualifications;
namespace WebApp.Models.Application.DTOs
{
    public class StaffDTO
    {
        public string? MecanographicNumber { get; set; }
        public string? ShortName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public StaffStatus Status { get; set; }
        public string? OperationalWindow { get; set; }
        public HashSet<Qualification>? Qualifications { get; set; }
    }
}
