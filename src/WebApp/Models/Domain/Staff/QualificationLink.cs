using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Domain.Staff
{
    public class QualificationLink
    {
        public Guid StaffId { get; private set; }
        public Guid QualificationId { get; private set; }

        private QualificationLink() { }

        public QualificationLink(Guid staffId, Guid qualificationId)
        {
            StaffId = staffId;
            QualificationId = qualificationId;
        }
    }
}
