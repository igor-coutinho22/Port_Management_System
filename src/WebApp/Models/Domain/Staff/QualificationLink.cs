using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Domain.Staff
{
    public class QualificationLink
    {
        public string StaffMecanographicNumber { get; set; } = default!;
        public Staff Staff { get; set; } = default!;

        public string QualificationCode { get; set; } = default!;
        public Qualification Qualification { get; set; } = default!;

        public DateOnly? DateObtained { get; set; }
        public DateOnly? ExpiryDate { get; set; }

        protected QualificationLink() { }

        public QualificationLink(string staffMecanographicNumber, string qualificationCode,
                                 DateOnly? dateObtained = null, DateOnly? expiryDate = null)
        {
            StaffMecanographicNumber = staffMecanographicNumber;
            QualificationCode = qualificationCode;
            DateObtained = dateObtained;
            ExpiryDate = expiryDate;
        }
    }
}
