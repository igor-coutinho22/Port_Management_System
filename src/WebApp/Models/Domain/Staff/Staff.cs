using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Domain.Staff
{
    public class Staff
    {
        public string MecanographicNumber { get; set; } = default!;
        public string ShortName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public StaffStatus Status { get; set; }
        public string OperationalWindow { get; set; } = default!; 
        public ICollection<QualificationLink> QualificationLinks { get; set; } = new List<QualificationLink>();

        protected Staff() { } // EF Core requirement

        public Staff(string mecanographicNumber, string shortName, string email, string phone,
                     StaffStatus status, string operationalWindow)
        {
            MecanographicNumber = mecanographicNumber;
            ShortName = shortName;
            Email = email;
            Phone = phone;
            Status = status;
            OperationalWindow = operationalWindow;
        }

        public void Activate()
        {
            if (Status == StaffStatus.Available)
                throw new InvalidOperationException("Staff is already active.");
            Status = StaffStatus.Available;
        }

        public void Deactivate()
        {
            if (Status == StaffStatus.Unavailable)
                throw new InvalidOperationException("Staff is already inactive.");
            Status = StaffStatus.Unavailable;
        }
    }
}
