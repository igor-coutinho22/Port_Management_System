using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Application.Mappers
{
    public static class QualificationMapper
    {
        public static QualificationDTO ToDTO(Qualification qualification)
        {
            if (qualification == null)
                throw new ArgumentNullException(nameof(qualification));

            return new QualificationDTO
            {
                Code = qualification.Code,
                Name = qualification.Name
            };
        }

        public static Qualification ToDomain(QualificationDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Qualification(dto.Code!, dto.Name!);
        }
    }
}
