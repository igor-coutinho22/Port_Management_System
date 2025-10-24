using WebApp.Models.Domain.Common;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Domain.Staff
{
    public class Staff : BaseEntity
    {
        public string MecanographicNumber { get; private set; }
        public string ShortName { get; private set; }
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public StaffStatus Status { get; private set; }

        public Schedule OperationalWindow { get; private set; }

        // Relação N:N com Qualification via tabela de junção
        public ICollection<QualificationLink> Qualifications { get; private set; } = new List<QualificationLink>();

        private Staff() { } // EF Core

        public Staff(string mecanographicNumber, string shortName, string email, string phone, Schedule operationalWindow)
        {
            Id = Guid.NewGuid();
            MecanographicNumber = mecanographicNumber;
            ShortName = shortName;
            Email = email;
            Phone = phone;
            Status = StaffStatus.Available;
            OperationalWindow = operationalWindow;
        }

        public void AddQualification(Guid qualificationId)
        {
            if (!Qualifications.Any(q => q.QualificationId == qualificationId))
                Qualifications.Add(new QualificationLink(Id, qualificationId));
        }

        public void ChangeStatus(StaffStatus newStatus)
        {
            Status = newStatus;
        }

        public void Deactivate() => Status = StaffStatus.Inactive;
        public void Reactivate() => Status = StaffStatus.Available;
    }
}
